from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

from database import MySQLDatabase

ROOT_DIR = Path(__file__).parent
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

load_dotenv(ROOT_DIR / '.env')

# Initialize MySQL Database
db = MySQLDatabase()

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'landclone-secret-key-2026')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

app = FastAPI(title="Nature Portal API")

# Mount static files for uploaded files (images/videos)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    import os
    from urllib.parse import urlparse
    
    # Check for MySQL connection URL first (e.g. Railway public URL)
    db_url = os.environ.get('MYSQL_PUBLIC_URL') or os.environ.get('MYSQL_URL') or os.environ.get('DATABASE_URL')
    
    MYSQL_HOST = None
    MYSQL_PORT = None
    MYSQL_USER = None
    MYSQL_PASSWORD = None
    MYSQL_DB = None

    if db_url and db_url.startswith("mysql"):
        try:
            # Handle standard scheme format for urlparse
            if db_url.startswith("mysql://"):
                parsed = urlparse(db_url)
            else:
                parsed = urlparse("mysql://" + db_url.split("://", 1)[-1])
            MYSQL_HOST = parsed.hostname
            MYSQL_PORT = parsed.port or 3306
            MYSQL_USER = parsed.username
            MYSQL_PASSWORD = parsed.password
            MYSQL_DB = parsed.path.lstrip('/')
            logger.info("Successfully parsed database connection details from database URL.")
        except Exception as e:
            logger.error(f"Failed to parse database URL: {e}")

    # Fallback to individual variables if not set from URL
    if not MYSQL_HOST:
        MYSQL_HOST = os.environ.get('MYSQL_HOST') or os.environ.get('MYSQLHOST') or 'localhost'
    if not MYSQL_PORT:
        port_env = os.environ.get('MYSQL_PORT') or os.environ.get('MYSQLPORT') or '3306'
        try:
            MYSQL_PORT = int(port_env)
        except ValueError:
            MYSQL_PORT = 3306
    if not MYSQL_USER:
        MYSQL_USER = os.environ.get('MYSQL_USER') or os.environ.get('MYSQLUSER') or 'root'
    if not MYSQL_PASSWORD:
        MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD') or os.environ.get('MYSQLPASSWORD') or ''
    if not MYSQL_DB:
        MYSQL_DB = os.environ.get('MYSQL_DB') or os.environ.get('MYSQLDATABASE') or os.environ.get('MYSQL_DATABASE') or 'property_portal'

    # Auto-rewrite Railway internal host to public host when running outside Railway (e.g. on Render)
    if MYSQL_HOST == "mysql.railway.internal":
        logger.info("Detected Railway internal host. Auto-rewriting to public Railway proxy host...")
        MYSQL_HOST = "zephyr.proxy.rlwy.net"
        MYSQL_PORT = 17528
        MYSQL_USER = "root"
        MYSQL_PASSWORD = "BomZXjbYbKAHcTkdWJStkbYewulNIUJL"
        MYSQL_DB = "railway"

    logger.info(f"Initializing MySQL Connection on {MYSQL_HOST}:{MYSQL_PORT}...")
    try:
        await db.initialize(MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB)
        logger.info("MySQL Connection and Tables Initialized Successfully.")
    except Exception as e:
        logger.error(f"CRITICAL: Failed to initialize MySQL Connection: {e}")
        logger.error("The application will start, but database operations will fail until MySQL is configured and running.")

# ==================== PYDANTIC MODELS ====================

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    phone: Optional[str] = None
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    id: str
    email: str
    name: str
    phone: Optional[str] = None
    role: str

# Property Models (Adapted for US Land Clone)
class PropertyBase(BaseModel):
    title: str
    description: Optional[str] = None
    property_type: str = "land"  # default to land
    property_subtype: str  # ranches, farms, hunting, timberland, waterfront, commercial, acreage
    price: float
    price_type: str = "sale"  # sale, lease
    city: str
    county: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    address: Optional[str] = None
    bedrooms: Optional[int] = 0
    bathrooms: Optional[int] = 0
    area_sqft: Optional[float] = None
    acres: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    images: List[str] = []
    amenities: List[str] = []
    floor_plan_url: Optional[str] = None
    virtual_tour_url: Optional[str] = None
    builder_name: Optional[str] = None
    builder_info: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    
    # Land-centric attributes
    soil_type: Optional[str] = None
    water_source: Optional[str] = None
    crop_history: Optional[str] = None
    fencing: Optional[str] = None
    road_width_ft: Optional[int] = None
    video_url: Optional[str] = None

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(PropertyBase):
    pass

class Property(PropertyBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    interest_count: int = 0

# Interest Model
class InterestCreate(BaseModel):
    property_id: str
    name: str
    email: EmailStr
    phone: str

class Interest(InterestCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    property_title: Optional[str] = None

# Contact Model
class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    message: str

class Contact(ContactCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_read: bool = False

# Blog Models
class BlogBase(BaseModel):
    title: str
    excerpt: Optional[str] = None
    content: str
    image_url: Optional[str] = None
    author_name: str = "Admin"
    is_published: bool = True

class BlogCreate(BlogBase):
    pass

class BlogUpdate(BlogBase):
    pass

class Blog(BlogBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        user = await db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.get_user_by_email(user_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = {
        "id": str(uuid.uuid4()),
        "email": user_data.email,
        "name": user_data.name,
        "phone": user_data.phone,
        "password": hash_password(user_data.password),
        "role": "customer",
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.create_user(user_dict)
    
    token = create_token(user_dict["id"], user_dict["email"], user_dict["role"])
    return TokenResponse(
        access_token=token,
        id=user_dict["id"],
        email=user_dict["email"],
        name=user_dict["name"],
        phone=user_dict["phone"],
        role=user_dict["role"]
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.get_user_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"], user["role"])
    return TokenResponse(
        access_token=token,
        id=user["id"],
        email=user["email"],
        name=user["name"],
        phone=user.get("phone"),
        role=user["role"]
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        phone=user.get("phone"),
        role=user["role"]
    )

# ==================== PROPERTY ROUTES ====================

@api_router.get("/properties")
async def get_properties(
    property_type: Optional[str] = None,
    property_subtype: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    county: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_acres: Optional[float] = None,
    max_acres: Optional[float] = None,
    bedrooms: Optional[int] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    properties = await db.get_properties(
        property_type=property_type,
        property_subtype=property_subtype,
        city=city,
        state=state,
        county=county,
        min_price=min_price,
        max_price=max_price,
        min_acres=min_acres,
        max_acres=max_acres,
        bedrooms=bedrooms,
        featured=featured,
        search=search,
        limit=limit,
        skip=skip
    )
    return properties

@api_router.get("/properties/featured")
async def get_featured_properties(limit: int = 6):
    return await db.get_featured_properties(limit)

@api_router.get("/properties/cities")
async def get_cities():
    """Get list of unique cities"""
    return await db.get_cities()

@api_router.get("/properties/states")
async def get_states():
    """Get list of unique states"""
    return await db.get_states()

@api_router.get("/properties/counties")
async def get_counties(state: Optional[str] = None):
    """Get list of unique counties, optionally filtered by state"""
    return await db.get_counties(state=state)

@api_router.get("/properties/{property_id}")
async def get_property(property_id: str):
    prop = await db.get_property_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Land not found")
    return prop

# ==================== SAVED PROPERTIES ROUTES ====================

@api_router.get("/users/saved-properties")
async def get_saved_properties(user: dict = Depends(get_current_user)):
    return await db.get_saved_properties(user["id"])

@api_router.post("/users/saved-properties/{property_id}")
async def add_saved_property(property_id: str, user: dict = Depends(get_current_user)):
    prop = await db.get_property_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    existing = await db.get_saved_property(user["id"], property_id)
    if existing:
        return {"message": "Property already saved"}
        
    await db.add_saved_property(user["id"], property_id)
    return {"message": "Property saved successfully"}

@api_router.delete("/users/saved-properties/{property_id}")
async def remove_saved_property(property_id: str, user: dict = Depends(get_current_user)):
    deleted = await db.remove_saved_property(user["id"], property_id)
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Property not found in saved list")
    return {"message": "Property removed from saved list"}

# ==================== INTEREST ROUTES (NO AUTH REQUIRED) ====================

@api_router.post("/properties/interest")
async def submit_interest(interest_data: InterestCreate):
    """Submit interest in a property/land - NO LOGIN REQUIRED"""
    prop = await db.get_property_by_id(interest_data.property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Land listing not found")
    
    existing = await db.get_interest(interest_data.property_id, interest_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="You have already expressed interest in this land listing")
    
    interest_dict = {
        "id": str(uuid.uuid4()),
        "property_id": interest_data.property_id,
        "property_title": prop.get("title"),
        "name": interest_data.name,
        "email": interest_data.email,
        "phone": interest_data.phone,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.create_interest(interest_dict)
    await db.increment_property_interest(interest_data.property_id)
    
    return {"message": "Interest submitted successfully", "id": interest_dict["id"]}

# ==================== CONTACT ROUTES (NO AUTH REQUIRED) ====================

@api_router.post("/contact")
async def submit_contact(contact_data: ContactCreate):
    """Submit contact form - NO LOGIN REQUIRED"""
    contact_dict = {
        "id": str(uuid.uuid4()),
        "name": contact_data.name,
        "email": contact_data.email,
        "phone": contact_data.phone,
        "message": contact_data.message,
        "created_at": datetime.now(timezone.utc),
        "is_read": False
    }
    
    await db.create_contact(contact_dict)
    return {"message": "Message sent successfully", "id": contact_dict["id"]}

# ==================== BLOG ROUTES (PUBLIC) ====================

@api_router.get("/blogs")
async def get_blogs(limit: int = 50, skip: int = 0):
    return await db.get_blogs(skip=skip, limit=limit)

@api_router.get("/blogs/{blog_id}")
async def get_blog(blog_id: str):
    blog = await db.get_blog_by_id(blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return blog

# ==================== ADMIN ROUTES ====================

@api_router.post("/admin/properties")
async def create_property(property_data: PropertyCreate, user: dict = Depends(get_admin_user)):
    property_dict = property_data.model_dump()
    property_dict["id"] = str(uuid.uuid4())
    property_dict["created_at"] = datetime.now(timezone.utc)
    property_dict["interest_count"] = 0
    
    await db.create_property(property_dict)
    return property_dict

@api_router.put("/admin/properties/{property_id}")
async def update_property(property_id: str, property_data: PropertyUpdate, user: dict = Depends(get_admin_user)):
    prop = await db.get_property_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Land listing not found")
    
    update_data = property_data.model_dump()
    updated = await db.update_property(property_id, update_data)
    return updated

@api_router.delete("/admin/properties/{property_id}")
async def delete_property(property_id: str, user: dict = Depends(get_admin_user)):
    deleted = await db.delete_property(property_id)
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Land listing not found")
    return {"message": "Land listing deleted successfully"}

@api_router.get("/admin/interests")
async def get_all_interests(
    property_id: Optional[str] = None,
    user: dict = Depends(get_admin_user)
):
    return await db.get_all_interests(property_id)

@api_router.get("/admin/contacts")
async def get_all_contacts(user: dict = Depends(get_admin_user)):
    return await db.get_contacts()

@api_router.put("/admin/contacts/{contact_id}/read")
async def mark_contact_read(contact_id: str, user: dict = Depends(get_admin_user)):
    matched = await db.mark_contact_read(contact_id)
    if matched == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Contact marked as read"}

@api_router.get("/admin/stats")
async def get_admin_stats(user: dict = Depends(get_admin_user)):
    return await db.get_admin_stats()

@api_router.get("/admin/users")
async def get_all_users(user: dict = Depends(get_admin_user)):
    users = await db.get_users()
    for u in users:
        u.pop("password", None)
    return users

@api_router.post("/admin/blogs")
async def create_blog(blog_data: BlogCreate, user: dict = Depends(get_admin_user)):
    blog_dict = blog_data.model_dump()
    blog_dict["id"] = str(uuid.uuid4())
    blog_dict["created_at"] = datetime.now(timezone.utc)
    blog_dict["updated_at"] = datetime.now(timezone.utc)
    
    await db.create_blog(blog_dict)
    return blog_dict

@api_router.get("/admin/blogs")
async def get_all_blogs(user: dict = Depends(get_admin_user)):
    return await db.get_blogs(all_blogs=True)

@api_router.put("/admin/blogs/{blog_id}")
async def update_blog(blog_id: str, blog_data: BlogUpdate, user: dict = Depends(get_admin_user)):
    blog = await db.get_blog_by_id(blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    update_data = blog_data.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    updated = await db.update_blog(blog_id, update_data)
    return updated

@api_router.delete("/admin/blogs/{blog_id}")
async def delete_blog(blog_id: str, user: dict = Depends(get_admin_user)):
    deleted = await db.delete_blog(blog_id)
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return {"message": "Blog post deleted successfully"}

# ==================== FILE UPLOADS ====================

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.mov', '.avi', '.webm'}
MAX_FILE_SIZE = 5 * 1024 * 1024       # 5MB
MAX_VIDEO_SIZE = 50 * 1024 * 1024    # 50MB

@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...), user: dict = Depends(get_admin_user)):
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed types: {ALLOWED_EXTENSIONS}")
    
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB")
    
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    image_url = f"/api/uploads/{unique_filename}"
    return {"url": image_url, "filename": unique_filename}

@api_router.post("/upload/images")
async def upload_multiple_images(files: List[UploadFile] = File(...), user: dict = Depends(get_admin_user)):
    uploaded_urls = []
    for file in files:
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            continue
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            continue
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = UPLOAD_DIR / unique_filename
        with open(file_path, "wb") as f:
            f.write(content)
        uploaded_urls.append(f"/api/uploads/{unique_filename}")
    return {"urls": uploaded_urls}

@api_router.post("/upload/video")
async def upload_video(file: UploadFile = File(...), user: dict = Depends(get_admin_user)):
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed types: {ALLOWED_VIDEO_EXTENSIONS}")
    
    content = await file.read()
    if len(content) > MAX_VIDEO_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB")
    
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    video_url = f"/api/uploads/{unique_filename}"
    return {"url": video_url, "filename": unique_filename}

# ==================== SEED DATA ====================

@api_router.get("/seed")
async def seed_data():
    """Seed initial data including admin user and sample USA land listings"""
    try:
        results = {}
        
        # Check if admin already exists
        admin_exists = await db.get_user_by_email("admin@makemypropertyz.com")
        if not admin_exists:
            admin_user = {
                "id": str(uuid.uuid4()),
                "email": "admin@makemypropertyz.com",
                "name": "Nature Portal Admin",
                "phone": "+91 98765 43210",
                "password": hash_password("admin123"),
                "role": "admin",
                "created_at": datetime.now(timezone.utc)
            }
            await db.create_user(admin_user)
            results["admin"] = "Created"
            
        admin_exists_2 = await db.get_user_by_email("admin@nature.com")
        if not admin_exists_2:
            admin_user_2 = {
                "id": str(uuid.uuid4()),
                "email": "admin@nature.com",
                "name": "Nature Owner Admin",
                "phone": "+91 98765 01234",
                "password": hash_password("admin123"),
                "role": "admin",
                "created_at": datetime.now(timezone.utc)
            }
            await db.create_user(admin_user_2)
            results["nature_admin"] = "Created"
        
        # Reset properties and blogs
        await db.delete_all_properties_and_blogs()
        
        # Seed Indian land listings matching Nature sub-types: farms, hunting, timberland, waterfront, commercial, acreage
        sample_lands = [
            {
                "id": str(uuid.uuid4()),
                "title": "Majestic Rajasthan Royal Ranch",
                "description": "Exquisite desert-edge ranch located in Jodhpur district. Features rolling sandy terrain, beautiful mature khejri groves, complete boundary fencing, and high-flow tube well. A pristine sanctuary perfect for agricultural activities, dairy farming, or a luxury countryside estate. Incredible sunset and desert views.",
                "property_type": "land",
                "property_subtype": "ranches",
                "price": 24500000.0,
                "price_type": "sale",
                "city": "Jodhpur",
                "county": "Jodhpur District",
                "state": "RJ",
                "zip_code": "342001",
                "address": "12 Girasar Road",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 6534000.0, # 150 Acres
                "acres": 150.0,
                "latitude": 26.2389,
                "longitude": 73.0243,
                "images": [
                    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900",
                    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900",
                    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900",
                    "https://images.unsplash.com/photo-1522002166668-3e4b7c6b5b54?w=900"
                ],
                "amenities": ["Water Well", "Electric Fencing", "Highway Access", "Paved Entrance", "Storage Barn"],
                "floor_plan_url": "",
                "virtual_tour_url": "",
                "builder_name": "Direct Land Sales",
                "builder_info": "Premium Rajasthan land and estate specialists.",
                "is_featured": True,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "interest_count": 0,
                "soil_type": "Sandy Loam & Desert Soil",
                "water_source": "Tube Well",
                "crop_history": "Native Grass & Bajra",
                "fencing": "Full Barbed Wire Fenced",
                "road_width_ft": 30,
                "video_url": "https://cdn.pixabay.com/video/2021/08/04/83861-584742517_large.mp4"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Maharashtra Alphonso Mango Orchard & Farm",
                "description": "Beautiful citrus and mango grove featuring active, high-yield Alphonso mango trees in coastal Maharashtra. Complete with underground drip irrigation fed by a deep borewell, equipment shed, and perfect building site for a private farmhouse. Fully accessible via public paved roads.",
                "property_type": "land",
                "property_subtype": "farms",
                "price": 9800000.0,
                "price_type": "sale",
                "city": "Ratnagiri",
                "county": "Ratnagiri District",
                "state": "MH",
                "zip_code": "415612",
                "address": "440 Alphonso Orchard Way",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 3484800.0, # 80 Acres
                "acres": 80.0,
                "latitude": 16.9902,
                "longitude": 73.3120,
                "images": [
                    "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=900",
                    "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=900",
                    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900",
                    "https://images.unsplash.com/photo-1628189679199-31ff97920ab7?w=900"
                ],
                "amenities": ["Underground Irrigation", "Deep Borewell", "Equipment Shed", "Power Hookup", "Paved Road Access"],
                "floor_plan_url": "",
                "virtual_tour_url": "",
                "builder_name": "Direct Land Sales",
                "builder_info": "Specialists in productive Maharashtra agricultural plots.",
                "is_featured": True,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "interest_count": 0,
                "soil_type": "Laterite & Red Loamy Soil",
                "water_source": "Borewell Pump",
                "crop_history": "Alphonso Mango",
                "fencing": "Perimeter Fenced",
                "road_width_ft": 24,
                "video_url": "https://cdn.pixabay.com/video/2021/08/04/83861-584742517_large.mp4"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Western Ghats Nature Retreat & Timberland",
                "description": "Spectacular forested acreage bordering the Western Ghats reserve in Coorg. Features panoramic mountain views, mature teak and rosewood plantations, and natural freshwater springs. Excellent conservation tract, off-grid eco-resort site, or premium private estate. Complete seasonal trail access.",
                "property_type": "land",
                "property_subtype": "hunting", # kept for database subtype alignment
                "price": 18500000.0,
                "price_type": "sale",
                "city": "Coorg",
                "county": "Kodagu District",
                "state": "KA",
                "zip_code": "571201",
                "address": "Madikeri Forest Boundary Rd",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 13939200.0, # 320 Acres
                "acres": 320.0,
                "latitude": 12.4244,
                "longitude": 75.7382,
                "images": [
                    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=900",
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900",
                    "https://images.unsplash.com/photo-1524147055964-b52e3e4a2e58?w=900",
                    "https://images.unsplash.com/photo-1522002166668-3e4b7c6b5b54?w=900"
                ],
                "amenities": ["Mountain Springs", "Borders Forest Reserve", "Timber Value", "Off-Grid Eco-Resort Site", "Jeep Trail"],
                "floor_plan_url": "",
                "virtual_tour_url": "",
                "builder_name": "Direct Land Sales",
                "builder_info": "Dedicated to recreational and mountain property sales.",
                "is_featured": True,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "interest_count": 0,
                "soil_type": "Mountain Forest Soil",
                "water_source": "Natural Springs",
                "crop_history": "Teak & Rosewood Timber",
                "fencing": "None",
                "road_width_ft": 15,
                "video_url": "https://cdn.pixabay.com/video/2021/08/04/83861-584742517_large.mp4"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Ganges Riverfront Organic Farm & Ranch",
                "description": "Premium acreage fronting the scenic Ganges River in Rishikesh. Perfect setting for organic farming, wellness retreat, or building a riverfront home. Includes senior water rights, flat lush pastures, power availability, and year-round road maintenance. A rare waterfront gem.",
                "property_type": "land",
                "property_subtype": "waterfront",
                "price": 12000000.0,
                "price_type": "sale",
                "city": "Rishikesh",
                "county": "Dehradun District",
                "state": "UK",
                "zip_code": "249201",
                "address": "780 River Meadows Road",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 5227200.0, # 120 Acres
                "acres": 120.0,
                "latitude": 30.0869,
                "longitude": 78.2676,
                "images": [
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900",
                    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900",
                    "https://images.unsplash.com/photo-1596431940989-1065b719463c?w=900",
                    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900"
                ],
                "amenities": ["River Frontage", "Water Rights", "Lush Meadows", "Electricity at Line", "Year-round Road"],
                "floor_plan_url": "",
                "virtual_tour_url": "",
                "builder_name": "Direct Land Sales",
                "builder_info": "Experts in premier waterfront and river estates.",
                "is_featured": False,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "interest_count": 0,
                "soil_type": "Alluvial Loam",
                "water_source": "River & Water Rights",
                "crop_history": "Organic Vegetables & Grass",
                "fencing": "Cross Fenced",
                "road_width_ft": 24,
                "video_url": "https://cdn.pixabay.com/video/2021/08/04/83861-584742517_large.mp4"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Himalayan View Alpine Acreage",
                "description": "Breathtaking high-altitude parcel in Manali, Himachal Pradesh. Nestled in a dense grove of Pine and Deodar trees. Magnificent views of the snow-capped Himalayan peaks. Ready for your dream villa, vacation getaway, or eco-retreat. Accessible via maintained road.",
                "property_type": "land",
                "property_subtype": "acreage",
                "price": 4250000.0,
                "price_type": "sale",
                "city": "Manali",
                "county": "Kullu District",
                "state": "HP",
                "zip_code": "175131",
                "address": "Lot 45 Solang Ridge Trail",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 1960200.0, # 45 Acres
                "acres": 45.0,
                "latitude": 32.2396,
                "longitude": 77.1887,
                "images": [
                    "https://images.unsplash.com/photo-1594900161121-705b0b29841c?w=900",
                    "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=900",
                    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900",
                    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=900"
                ],
                "amenities": ["Alpine Forest", "Stunning Ridge Views", "Access Road", "Electric Nearby", "No HOA"],
                "floor_plan_url": "",
                "virtual_tour_url": "",
                "builder_name": "Direct Land Sales",
                "builder_info": "Curators of premium Himalayan mountain lands.",
                "is_featured": False,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "interest_count": 0,
                "soil_type": "Himalayan Gravelly Soil",
                "water_source": "Spring Water (Need Piping)",
                "crop_history": "Natural Pines & Deodars",
                "fencing": "None",
                "road_width_ft": 20,
                "video_url": "https://cdn.pixabay.com/video/2021/08/04/83861-584742517_large.mp4"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Nilgiri Tea & Pine Plantation Tract",
                "description": "Excellent investment tract containing fully managed, fast-growing pine and tea plantation in the Nilgiri hills. Road networks throughout, completely rolling terrain, well-suited for tea harvest rotation and lease income. Borders paved state highway.",
                "property_type": "land",
                "property_subtype": "timberland",
                "price": 6500000.0,
                "price_type": "sale",
                "city": "Ooty",
                "county": "Nilgiris District",
                "state": "TN",
                "zip_code": "643001",
                "address": "Coonoor Highway Tea Tract",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 9147600.0, # 210 Acres
                "acres": 210.0,
                "latitude": 11.4102,
                "longitude": 76.6950,
                "images": [
                    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=900",
                    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900",
                    "https://images.unsplash.com/photo-1522002166668-3e4b7c6b5b54?w=900",
                    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900"
                ],
                "amenities": ["Managed Tea Plantation", "Harvest Road Network", "State Hwy Frontage", "Rolling Hills"],
                "floor_plan_url": "",
                "virtual_tour_url": "",
                "builder_name": "Direct Land Sales",
                "builder_info": "Timber and commercial agroforestry land brokers.",
                "is_featured": False,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "interest_count": 0,
                "soil_type": "Red Acidic Tea Soil",
                "water_source": "Mountain Creeks",
                "crop_history": "Assam & Nilgiri Tea",
                "fencing": "Partially Boundary Blazed",
                "road_width_ft": 25,
                "video_url": "https://cdn.pixabay.com/video/2021/08/04/83861-584742517_large.mp4"
            }
        ]
        
        await db.insert_properties(sample_lands)
        results["properties"] = "Seeded"
        
        # Seed land blogs
        sample_blogs = [
            {
                "id": str(uuid.uuid4()),
                "title": "A Guide to Buying Land and Inspecting Soil Types in India",
                "excerpt": "Discover what to look for when inspecting farming acreage, understanding loam, clay, and black cotton soil properties.",
                "content": "Before buying land in India, the soil type is one of the most critical aspects. Red loamy soil and black cotton soil are highly productive for various crops, while rocky soils require specific foundation work. Always run a soil test or check government soil surveys to analyze drainage, composition, and crop compatibility.",
                "image_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
                "author_name": "Nature Team",
                "is_published": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Understanding Water Rights & Borewell Permissions on Indian Farm Land",
                "excerpt": "Learn how groundwater regulations and river water rights impact your land ownership and investment value.",
                "content": "Water is crucial on agricultural land. Whether it is canal water access or local borewell drilling permissions, understand what regulations apply in the state. Separately, verify title deeds and local land ceiling limits before finalizing any transactions.",
                "image_url": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
                "author_name": "Legal Department",
                "is_published": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        ]
        
        await db.insert_blogs(sample_blogs)
        results["blogs"] = "Seeded"
        
        return {"message": "Seed operation complete", "results": results}
    
    except Exception as e:
        logger.error(f"Seeding failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Seeding failed: {str(e)}")

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "Nature Portal API", "version": "1.0.0", "tagline": "Pure Earth, Beautiful Nature"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

@api_router.get("/db-status")
async def db_status():
    import os
    db_url = os.environ.get('MYSQL_PUBLIC_URL') or os.environ.get('MYSQL_URL') or os.environ.get('DATABASE_URL')
    
    def sanitize_url(url):
        if not url: return None
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            if parsed.password:
                return url.replace(parsed.password, "********")
        except:
            pass
        return url

    status_info = {
        "db_initialized": db.pool is not None,
        "MYSQL_PUBLIC_URL": sanitize_url(os.environ.get('MYSQL_PUBLIC_URL')),
        "MYSQL_URL": sanitize_url(os.environ.get('MYSQL_URL')),
        "DATABASE_URL": sanitize_url(os.environ.get('DATABASE_URL')),
        "MYSQL_HOST_env": os.environ.get('MYSQL_HOST'),
        "MYSQLHOST_env": os.environ.get('MYSQLHOST'),
        "MYSQL_PORT_env": os.environ.get('MYSQL_PORT'),
        "MYSQLPORT_env": os.environ.get('MYSQLPORT'),
        "MYSQL_USER_env": os.environ.get('MYSQL_USER'),
        "MYSQLUSER_env": os.environ.get('MYSQLUSER'),
        "MYSQL_DB_env": os.environ.get('MYSQL_DB'),
        "MYSQLDATABASE_env": os.environ.get('MYSQLDATABASE'),
        "MYSQL_DATABASE_env": os.environ.get('MYSQL_DATABASE'),
    }
    
    if db.pool:
        try:
            async with db.pool.acquire() as conn:
                async with conn.cursor() as cur:
                    await cur.execute("SELECT 1")
                    status_info["query_test"] = "Success"
        except Exception as e:
            status_info["query_test"] = f"Failed: {str(e)}"
    else:
        status_info["query_test"] = "Pool is None"
        
    return status_info

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
