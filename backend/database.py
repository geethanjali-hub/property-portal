import aiomysql
import json
import logging
import uuid
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

def parse_json_fields(row):
    if not row:
        return row
    
    # Handle list fields which are stored as JSON strings in MySQL
    for field in ['images', 'amenities']:
        if field in row:
            if isinstance(row[field], str):
                try:
                    row[field] = json.loads(row[field])
                except Exception:
                    row[field] = []
            elif row[field] is None:
                row[field] = []
                
    # Normalize types
    for field in ['price', 'area_sqft', 'acres', 'latitude', 'longitude']:
        if field in row and row[field] is not None:
            row[field] = float(row[field])
            
    for field in ['is_featured', 'is_active', 'is_read', 'is_published']:
        if field in row and row[field] is not None:
            row[field] = bool(row[field])
            
    return row

class MySQLDatabase:
    def __init__(self):
        self.pool = None
        self.host = None
        self.port = None
        self.user = None
        self.password = None
        self.db_name = None

    async def initialize(self, host, port, user, password, db_name):
        self.host = host
        self.port = int(port)
        self.user = user
        self.password = password
        self.db_name = db_name

        # First connect without db to create it if not exists
        conn = await aiomysql.connect(
            host=self.host,
            port=self.port,
            user=self.user,
            password=self.password,
            autocommit=True
        )
        async with conn.cursor() as cur:
            await cur.execute(f"CREATE DATABASE IF NOT EXISTS `{self.db_name}`")
        conn.close()

        # Create connection pool
        self.pool = await aiomysql.create_pool(
            host=self.host,
            port=self.port,
            user=self.user,
            password=self.password,
            db=self.db_name,
            autocommit=True,
            minsize=1,
            maxsize=10
        )
        
        # Create tables
        await self.create_tables()

    async def create_tables(self):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Users table
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id VARCHAR(36) PRIMARY KEY,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        phone VARCHAR(50),
                        password VARCHAR(255) NOT NULL,
                        role VARCHAR(50) NOT NULL DEFAULT 'customer',
                        created_at DATETIME NOT NULL
                    )
                """)
                
                # Properties table (adapted for USA Land, matching Land.com clone)
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS properties (
                        id VARCHAR(36) PRIMARY KEY,
                        title VARCHAR(255) NOT NULL,
                        description TEXT,
                        property_type VARCHAR(50) NOT NULL,
                        property_subtype VARCHAR(50) NOT NULL,
                        price DECIMAL(15, 2) NOT NULL,
                        price_type VARCHAR(50) NOT NULL DEFAULT 'sale',
                        city VARCHAR(100) NOT NULL,
                        county VARCHAR(100),
                        state VARCHAR(100),
                        zip_code VARCHAR(20),
                        address TEXT,
                        bedrooms INT DEFAULT 0,
                        bathrooms INT DEFAULT 0,
                        area_sqft DECIMAL(15, 2),
                        acres DECIMAL(15, 2),
                        latitude DECIMAL(10, 8),
                        longitude DECIMAL(11, 8),
                        images JSON,
                        amenities JSON,
                        floor_plan_url VARCHAR(255),
                        virtual_tour_url VARCHAR(255),
                        builder_name VARCHAR(255),
                        builder_info TEXT,
                        is_featured BOOLEAN DEFAULT FALSE,
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at DATETIME NOT NULL,
                        interest_count INT DEFAULT 0,
                        soil_type VARCHAR(100),
                        water_source VARCHAR(255),
                        crop_history TEXT,
                        fencing VARCHAR(100),
                        road_width_ft INT,
                        video_url VARCHAR(255)
                    )
                """)

                # Interests table (Inquiries)
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS interests (
                        id VARCHAR(36) PRIMARY KEY,
                        property_id VARCHAR(36) NOT NULL,
                        property_title VARCHAR(255),
                        name VARCHAR(255) NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        phone VARCHAR(50) NOT NULL,
                        created_at DATETIME NOT NULL,
                        UNIQUE KEY unique_interest (property_id, email)
                    )
                """)

                # Contacts table
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS contacts (
                        id VARCHAR(36) PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        phone VARCHAR(50) NOT NULL,
                        message TEXT NOT NULL,
                        created_at DATETIME NOT NULL,
                        is_read BOOLEAN DEFAULT FALSE
                    )
                """)

                # Blogs table
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS blogs (
                        id VARCHAR(36) PRIMARY KEY,
                        title VARCHAR(255) NOT NULL,
                        excerpt TEXT,
                        content TEXT NOT NULL,
                        image_url VARCHAR(255),
                        author_name VARCHAR(100) DEFAULT 'Admin',
                        is_published BOOLEAN DEFAULT TRUE,
                        created_at DATETIME NOT NULL,
                        updated_at DATETIME NOT NULL
                    )
                """)

                # Saved properties table (Wishlist for logged-in buyers)
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS saved_properties (
                        id VARCHAR(36) PRIMARY KEY,
                        user_id VARCHAR(36) NOT NULL,
                        property_id VARCHAR(36) NOT NULL,
                        created_at DATETIME NOT NULL,
                        UNIQUE KEY unique_user_property (user_id, property_id)
                    )
                """)

    async def get_user_by_email(self, email):
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT * FROM users WHERE email = %s", (email,))
                return await cur.fetchone()

    async def get_user_by_id(self, id):
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT * FROM users WHERE id = %s", (id,))
                return await cur.fetchone()

    async def create_user(self, user_dict):
        fields = ['id', 'email', 'name', 'phone', 'password', 'role', 'created_at']
        cols = ", ".join(fields)
        vals = ", ".join(["%s"] * len(fields))
        query = f"INSERT INTO users ({cols}) VALUES ({vals})"
        params = [user_dict.get(f) for f in fields]
        
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, tuple(params))
        return user_dict

    async def get_users(self):
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT * FROM users")
                return await cur.fetchall()

    async def get_properties(self, property_type=None, property_subtype=None, city=None, state=None, county=None, min_price=None, max_price=None, min_acres=None, max_acres=None, bedrooms=None, featured=None, search=None, limit=50, skip=0):
        query = "SELECT * FROM properties WHERE is_active = TRUE"
        params = []
        
        if property_type:
            query += " AND property_type = %s"
            params.append(property_type)
        if property_subtype:
            query += " AND property_subtype = %s"
            params.append(property_subtype)
        if city:
            query += " AND city LIKE %s"
            params.append(f"%{city}%")
        if state:
            query += " AND state = %s"
            params.append(state)
        if county:
            query += " AND county LIKE %s"
            params.append(f"%{county}%")
        if min_price is not None:
            query += " AND price >= %s"
            params.append(min_price)
        if max_price is not None:
            query += " AND price <= %s"
            params.append(max_price)
        if min_acres is not None:
            query += " AND acres >= %s"
            params.append(min_acres)
        if max_acres is not None:
            query += " AND acres <= %s"
            params.append(max_acres)
        if bedrooms:
            query += " AND bedrooms = %s"
            params.append(bedrooms)
        if featured is not None:
            query += " AND is_featured = %s"
            params.append(1 if featured else 0)
        if search:
            state_map = {
                "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR", "california": "CA", "colorado": "CO",
                "connecticut": "CT", "delaware": "DE", "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID",
                "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS", "kentucky": "KY", "louisiana": "LA",
                "maine": "ME", "maryland": "MD", "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS",
                "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV", "new hampshire": "NH", "new jersey": "NJ",
                "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND", "ohio": "OH", "oklahoma": "OK",
                "oregon": "OR", "pennsylvania": "PA", "rhode island": "RI", "south carolina": "SC", "south dakota": "SD",
                "tennessee": "TN", "texas": "TX", "utah": "UT", "vermont": "VT", "virginia": "VA", "washington": "WA",
                "west virginia": "WV", "wisconsin": "WI", "wyoming": "WY"
            }
            search_clause = "(title LIKE %s OR description LIKE %s OR city LIKE %s OR county LIKE %s OR state LIKE %s OR zip_code LIKE %s"
            s = f"%{search}%"
            search_params = [s, s, s, s, s, s]
            
            # Map full state names to abbreviations if present in the search term
            search_words = [w.strip(",.!?").lower() for w in search.split()]
            found_states = []
            for word in search_words:
                if word in state_map:
                    found_states.append(state_map[word])
            
            # Also check exact matching of full phrase if multi-word state like "New York"
            search_lower = search.lower().strip()
            for fullname, code in state_map.items():
                if fullname in search_lower and code not in found_states:
                    found_states.append(code)
                    
            for state_code in found_states:
                search_clause += " OR state = %s"
                search_params.append(state_code)
                
            search_clause += ")"
            query += f" AND {search_clause}"
            params.extend(search_params)
            
        query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, skip])
        
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute(query, tuple(params))
                rows = await cur.fetchall()
                return [parse_json_fields(row) for row in rows]

    async def get_featured_properties(self, limit=6):
        query = "SELECT * FROM properties WHERE is_active = TRUE AND is_featured = TRUE ORDER BY created_at DESC LIMIT %s"
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute(query, (limit,))
                rows = await cur.fetchall()
                return [parse_json_fields(row) for row in rows]

    async def get_property_by_id(self, id):
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT * FROM properties WHERE id = %s", (id,))
                row = await cur.fetchone()
                return parse_json_fields(row)

    async def create_property(self, property_dict):
        p = dict(property_dict)
        p['images'] = json.dumps(p.get('images', []))
        p['amenities'] = json.dumps(p.get('amenities', []))
        p['is_featured'] = 1 if p.get('is_featured') else 0
        p['is_active'] = 1 if p.get('is_active') else 0
        
        # Ensure all columns are present
        for field in ['soil_type', 'water_source', 'crop_history', 'fencing', 'road_width_ft', 'video_url', 'county', 'state', 'zip_code', 'acres', 'latitude', 'longitude']:
            if field not in p:
                p[field] = None

        fields = [
            'id', 'title', 'description', 'property_type', 'property_subtype', 'price', 'price_type',
            'city', 'county', 'state', 'zip_code', 'address', 'bedrooms', 'bathrooms', 'area_sqft', 'acres',
            'latitude', 'longitude', 'images', 'amenities', 'floor_plan_url', 'virtual_tour_url',
            'builder_name', 'builder_info', 'is_featured', 'is_active', 'created_at', 'interest_count',
            'soil_type', 'water_source', 'crop_history', 'fencing', 'road_width_ft', 'video_url'
        ]
        
        cols = ", ".join(fields)
        vals = ", ".join(["%s"] * len(fields))
        query = f"INSERT INTO properties ({cols}) VALUES ({vals})"
        params = [p.get(f) for f in fields]
        
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, tuple(params))
        return property_dict

    async def update_property(self, id, property_dict):
        p = dict(property_dict)
        p['images'] = json.dumps(p.get('images', []))
        p['amenities'] = json.dumps(p.get('amenities', []))
        p['is_featured'] = 1 if p.get('is_featured') else 0
        p['is_active'] = 1 if p.get('is_active') else 0
        
        for field in ['soil_type', 'water_source', 'crop_history', 'fencing', 'road_width_ft', 'video_url', 'county', 'state', 'zip_code', 'acres', 'latitude', 'longitude']:
            if field not in p:
                p[field] = None

        fields = [
            'title', 'description', 'property_type', 'property_subtype', 'price', 'price_type',
            'city', 'county', 'state', 'zip_code', 'address', 'bedrooms', 'bathrooms', 'area_sqft', 'acres',
            'latitude', 'longitude', 'images', 'amenities', 'floor_plan_url', 'virtual_tour_url',
            'builder_name', 'builder_info', 'is_featured', 'is_active',
            'soil_type', 'water_source', 'crop_history', 'fencing', 'road_width_ft', 'video_url'
        ]
        
        set_clause = ", ".join([f"{f} = %s" for f in fields])
        query = f"UPDATE properties SET {set_clause} WHERE id = %s"
        params = [p.get(f) for f in fields] + [id]
        
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, tuple(params))
                
        return await self.get_property_by_id(id)

    async def delete_property(self, id):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("DELETE FROM properties WHERE id = %s", (id,))
                return cur.rowcount

    async def get_cities(self):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT DISTINCT city FROM properties WHERE is_active = TRUE ORDER BY city")
                rows = await cur.fetchall()
                return [row[0] for row in rows]

    async def get_states(self):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT DISTINCT state FROM properties WHERE is_active = TRUE AND state IS NOT NULL AND state != '' ORDER BY state")
                rows = await cur.fetchall()
                return [row[0] for row in rows]

    async def get_counties(self, state=None):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                if state:
                    await cur.execute("SELECT DISTINCT county FROM properties WHERE is_active = TRUE AND state = %s AND county IS NOT NULL AND county != '' ORDER BY county", (state,))
                else:
                    await cur.execute("SELECT DISTINCT county FROM properties WHERE is_active = TRUE AND county IS NOT NULL AND county != '' ORDER BY county")
                rows = await cur.fetchall()
                return [row[0] for row in rows]

    async def get_interest(self, property_id, email):
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT * FROM interests WHERE property_id = %s AND email = %s", (property_id, email))
                return await cur.fetchone()

    async def get_all_interests(self, property_id=None):
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                if property_id:
                    await cur.execute("SELECT * FROM interests WHERE property_id = %s ORDER BY created_at DESC", (property_id,))
                else:
                    await cur.execute("SELECT * FROM interests ORDER BY created_at DESC")
                return await cur.fetchall()

    async def create_interest(self, interest_dict):
        fields = ['id', 'property_id', 'property_title', 'name', 'email', 'phone', 'created_at']
        cols = ", ".join(fields)
        vals = ", ".join(["%s"] * len(fields))
        query = f"INSERT INTO interests ({cols}) VALUES ({vals})"
        params = [interest_dict.get(f) for f in fields]
        
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, tuple(params))
        return interest_dict

    async def increment_property_interest(self, property_id):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("UPDATE properties SET interest_count = interest_count + 1 WHERE id = %s", (property_id,))

    async def create_contact(self, contact_dict):
        fields = ['id', 'name', 'email', 'phone', 'message', 'created_at', 'is_read']
        c = dict(contact_dict)
        c['is_read'] = 1 if c.get('is_read') else 0
        cols = ", ".join(fields)
        vals = ", ".join(["%s"] * len(fields))
        query = f"INSERT INTO contacts ({cols}) VALUES ({vals})"
        params = [c.get(f) for f in fields]
        
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, tuple(params))
        return contact_dict

    async def get_contacts(self):
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT * FROM contacts ORDER BY created_at DESC")
                rows = await cur.fetchall()
                for row in rows:
                    row['is_read'] = bool(row['is_read'])
                return rows

    async def mark_contact_read(self, contact_id):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("UPDATE contacts SET is_read = TRUE WHERE id = %s", (contact_id,))
                return cur.rowcount

    async def get_blogs(self, skip=0, limit=50, all_blogs=False):
        query = "SELECT * FROM blogs"
        if not all_blogs:
            query += " WHERE is_published = TRUE"
        query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute(query, (limit, skip))
                rows = await cur.fetchall()
                for r in rows:
                    r['is_published'] = bool(r['is_published'])
                return rows

    async def get_blog_by_id(self, id):
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT * FROM blogs WHERE id = %s", (id,))
                r = await cur.fetchone()
                if r:
                    r['is_published'] = bool(r['is_published'])
                return r

    async def create_blog(self, blog_dict):
        fields = ['id', 'title', 'excerpt', 'content', 'image_url', 'author_name', 'is_published', 'created_at', 'updated_at']
        b = dict(blog_dict)
        b['is_published'] = 1 if b.get('is_published') else 0
        cols = ", ".join(fields)
        vals = ", ".join(["%s"] * len(fields))
        query = f"INSERT INTO blogs ({cols}) VALUES ({vals})"
        params = [b.get(f) for f in fields]
        
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, tuple(params))
        return blog_dict

    async def update_blog(self, id, blog_dict):
        b = dict(blog_dict)
        b['is_published'] = 1 if b.get('is_published') else 0
        fields = ['title', 'excerpt', 'content', 'image_url', 'author_name', 'is_published', 'updated_at']
        set_clause = ", ".join([f"{f} = %s" for f in fields])
        query = f"UPDATE blogs SET {set_clause} WHERE id = %s"
        params = [b.get(f) for f in fields] + [id]
        
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, tuple(params))
        return await self.get_blog_by_id(id)

    async def delete_blog(self, id):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("DELETE FROM blogs WHERE id = %s", (id,))
                return cur.rowcount

    async def get_admin_stats(self):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT COUNT(*) FROM properties WHERE is_active = TRUE")
                total_properties = (await cur.fetchone())[0]
                
                await cur.execute("SELECT COUNT(*) FROM interests")
                total_interests = (await cur.fetchone())[0]
                
                await cur.execute("SELECT COUNT(*) FROM contacts")
                total_contacts = (await cur.fetchone())[0]
                
                await cur.execute("SELECT COUNT(*) FROM contacts WHERE is_read = FALSE")
                unread_contacts = (await cur.fetchone())[0]
                
                await cur.execute("SELECT COUNT(*) FROM properties WHERE property_subtype = 'ranches' AND is_active = TRUE")
                ranches_count = (await cur.fetchone())[0]
                
                await cur.execute("SELECT COUNT(*) FROM properties WHERE property_subtype = 'farms' AND is_active = TRUE")
                farms_count = (await cur.fetchone())[0]
                
                return {
                    "total_properties": total_properties,
                    "total_interests": total_interests,
                    "total_contacts": total_contacts,
                    "unread_contacts": unread_contacts,
                    "residential_properties": ranches_count, # Map ranches to residential
                    "commercial_properties": farms_count     # Map farms to commercial
                }

    async def delete_all_properties_and_blogs(self):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("DELETE FROM properties")
                await cur.execute("DELETE FROM blogs")

    async def get_saved_properties(self, user_id):
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT p.* FROM properties p
                    JOIN saved_properties s ON p.id = s.property_id
                    WHERE s.user_id = %s AND p.is_active = TRUE
                """, (user_id,))
                rows = await cur.fetchall()
                return [parse_json_fields(row) for row in rows]

    async def get_saved_property(self, user_id, property_id):
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT * FROM saved_properties WHERE user_id = %s AND property_id = %s", (user_id, property_id))
                return await cur.fetchone()

    async def add_saved_property(self, user_id, property_id):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    INSERT INTO saved_properties (id, user_id, property_id, created_at)
                    VALUES (%s, %s, %s, %s)
                """, (str(uuid.uuid4()), user_id, property_id, datetime.now(timezone.utc)))

    async def remove_saved_property(self, user_id, property_id):
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("DELETE FROM saved_properties WHERE user_id = %s AND property_id = %s", (user_id, property_id))
                return cur.rowcount

    async def insert_properties(self, properties_list):
        for prop in properties_list:
            await self.create_property(prop)

    async def insert_blogs(self, blogs_list):
        for blog in blogs_list:
            await self.create_blog(blog)
