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

app = FastAPI(title="Land.com Clone API")

# Mount static files for uploaded files (images/videos)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT', 3306))
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'property_portal')
    
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
                "name": "Land.com Portal Admin",
                "phone": "+1 (800) 555-0199",
                "password": hash_password("admin123"),
                "role": "admin",
                "created_at": datetime.now(timezone.utc)
            }
            await db.create_user(admin_user)
            results["admin"] = "Created"
        else:
            results["admin"] = "Already exists"
            
        admin_exists_2 = await db.get_user_by_email("admin@land.com")
        if not admin_exists_2:
            admin_user_2 = {
                "id": str(uuid.uuid4()),
                "email": "admin@land.com",
                "name": "Land.com Owner Admin",
                "phone": "+1 (800) 555-0100",
                "password": hash_password("admin123"),
                "role": "admin",
                "created_at": datetime.now(timezone.utc)
            }
            await db.create_user(admin_user_2)
            results["land_admin"] = "Created"
        
        # Reset properties and blogs
        await db.delete_all_properties_and_blogs()
        
        # Seed USA land listings matching Land.com sub-types:
        # ranches, farms, hunting, timberland, waterfront, commercial, acreage
        sample_lands = [
            {
                "id": str(uuid.uuid4()),
                "title": "Majestic Texas Star Ranch",
                "description": "Exquisite Texas Hill Country ranch located in Gillespie County. Features rolling landscape, beautiful mature oak groves, complete perimeter fence, and high-flow water well. A pristine sanctuary perfect for livestock, equestrian activities, or a luxury country estate. Incredible mountain and sunset views.",
                "property_type": "land",
                "property_subtype": "ranches",
                "price": 2450000.0,
                "price_type": "sale",
                "city": "Fredericksburg",
                "county": "Gillespie County",
                "state": "TX",
                "zip_code": "78624",
                "address": "1200 Old Mason Road",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 6534000.0, # 150 Acres
                "acres": 150.0,
                "latitude": 30.2740,
                "longitude": -98.8720,
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
                "builder_info": "Premium Texas land and ranch specialists.",
                "is_featured": True,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "interest_count": 0,
                "soil_type": "Sandy Loam & Limestone",
                "water_source": "Private Deep Well",
                "crop_history": "Native Grass Pasture",
                "fencing": "Full Barbed Wire Fenced",
                "road_width_ft": 30,
                "video_url": "https://cdn.pixabay.com/video/2021/08/04/83861-584742517_large.mp4"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Florida Citrus Grove & Hobby Farm",
                "description": "Beautiful citrus grove featuring active, high-yield orange and grapefruit trees in central Florida. Complete with underground drip irrigation fed by a deep-aquifer well, equipment shed, and perfect building site for a private farmhouse. Fully accessible via public paved county roads.",
                "property_type": "land",
                "property_subtype": "farms",
                "price": 980000.0,
                "price_type": "sale",
                "city": "Lakeland",
                "county": "Polk County",
                "state": "FL",
                "zip_code": "33801",
                "address": "440 Citrus Grove Way",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 3484800.0, # 80 Acres
                "acres": 80.0,
                "latitude": 27.9600,
                "longitude": -81.7600,
                "images": [
                    "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=900",
                    "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=900",
                    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900",
                    "https://images.unsplash.com/photo-1628189679199-31ff97920ab7?w=900"
                ],
                "amenities": ["Underground Irrigation", "Deep Aquifer Well", "Equipment Shed", "Power Hookup", "Paved Road Access"],
                "floor_plan_url": "",
                "virtual_tour_url": "",
                "builder_name": "Direct Land Sales",
                "builder_info": "Specialists in productive Florida agricultural plots.",
                "is_featured": True,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "interest_count": 0,
                "soil_type": "Sandy Clay Loam",
                "water_source": "Deep Aquifer Pump",
                "crop_history": "Orange Grove (Valencia)",
                "fencing": "Perimeter Fenced",
                "road_width_ft": 24,
                "video_url": "https://cdn.pixabay.com/video/2021/08/04/83861-584742517_large.mp4"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Montana Wilderness Hunting Forest",
                "description": "Spectacular forest acreage bordering the Flathead National Forest. Features panoramic mountain views, mature Douglas fir and pine, and natural freshwater springs. Excellent hunting tract for elk, deer, and bear, or build an off-grid log cabin. Complete seasonal jeep trail access.",
                "property_type": "land",
                "property_subtype": "hunting",
                "price": 1850000.0,
                "price_type": "sale",
                "city": "Kalispell",
                "county": "Flathead County",
                "state": "MT",
                "zip_code": "59901",
                "address": "NPS Forest Boundary Rd",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 13939200.0, # 320 Acres
                "acres": 320.0,
                "latitude": 48.2000,
                "longitude": -114.3000,
                "images": [
                    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=900",
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900",
                    "https://images.unsplash.com/photo-1524147055964-b52e3e4a2e58?w=900",
                    "https://images.unsplash.com/photo-1522002166668-3e4b7c6b5b54?w=900"
                ],
                "amenities": ["Mountain Springs", "Borders Public Land", "Timber Value", "Off-Grid Cabin Site", "Jeep Trail"],
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
                "crop_history": "Douglas Fir Timber",
                "fencing": "None",
                "road_width_ft": 15,
                "video_url": "https://cdn.pixabay.com/video/2021/08/04/83861-584742517_large.mp4"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Wyoming Riverfront Fly-Fishing Ranch",
                "description": "Premium acreage fronting the scenic North Platte River. Perfect setting for fly-fishing, equestrian activities, or building a riverfront home. Includes senior water rights, flat lush pastures, power availability, and year-round county road maintenance. A rare waterfront gem.",
                "property_type": "land",
                "property_subtype": "waterfront",
                "price": 1200000.0,
                "price_type": "sale",
                "city": "Wheatland",
                "county": "Platte County",
                "state": "WY",
                "zip_code": "82201",
                "address": "780 River Meadows Road",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 5227200.0, # 120 Acres
                "acres": 120.0,
                "latitude": 42.0600,
                "longitude": -104.9500,
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
                "builder_info": "Experts in premier waterfront and river ranches.",
                "is_featured": False,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "interest_count": 0,
                "soil_type": "Alluvial Loam",
                "water_source": "River & Water Rights",
                "crop_history": "Alfalfa & Pasture Grass",
                "fencing": "Cross Fenced",
                "road_width_ft": 24,
                "video_url": "https://cdn.pixabay.com/video/2021/08/04/83861-584742517_large.mp4"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Colorado Mountain View Alpine Acreage",
                "description": "Breathtaking high-altitude parcel in Park County, CO. Nestled in a dense grove of Aspen and Lodgepole Pine trees. Magnificent views of the snow-capped Rocky Mountains. Ready for your dream cabin, vacation getaway, or eco-retreat. Accessible via maintained dirt road.",
                "property_type": "land",
                "property_subtype": "acreage",
                "price": 425000.0,
                "price_type": "sale",
                "city": "Fairplay",
                "county": "Park County",
                "state": "CO",
                "zip_code": "80440",
                "address": "Lot 45 Aspen Ridge Trail",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 1960200.0, # 45 Acres
                "acres": 45.0,
                "latitude": 39.1200,
                "longitude": -105.7800,
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
                "builder_info": "Curators of premium Rocky Mountain mountain lands.",
                "is_featured": False,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "interest_count": 0,
                "soil_type": "Rocky Mountain Gravelly Soil",
                "water_source": "Well Permitted (Need Drill)",
                "crop_history": "Natural Pines & Aspens",
                "fencing": "None",
                "road_width_ft": 20,
                "video_url": "https://cdn.pixabay.com/video/2021/08/04/83861-584742517_large.mp4"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Georgia Pine Forest Investment Tract",
                "description": "Excellent investment tract containing fully managed, fast-growing Loblolly Pine plantation in South Georgia. Road networks throughout, completely flat terrain, well-suited for timber harvest rotation and lease income from hunters. Borders paved state highway.",
                "property_type": "land",
                "property_subtype": "timberland",
                "price": 650000.0,
                "price_type": "sale",
                "city": "Waycross",
                "county": "Ware County",
                "state": "GA",
                "zip_code": "31501",
                "address": "Hwy 84 East Timber Tract",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 9147600.0, # 210 Acres
                "acres": 210.0,
                "latitude": 31.2100,
                "longitude": -82.3500,
                "images": [
                    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=900",
                    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900",
                    "https://images.unsplash.com/photo-1522002166668-3e4b7c6b5b54?w=900",
                    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900"
                ],
                "amenities": ["Managed Pine Stand", "Hunting Lease Ready", "Harvest Road Network", "State Hwy Frontage", "Flat Terrain"],
                "floor_plan_url": "",
                "virtual_tour_url": "",
                "builder_name": "Direct Land Sales",
                "builder_info": "Timber and commercial agroforestry land brokers.",
                "is_featured": False,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "interest_count": 0,
                "soil_type": "Sandy Acidic Timber Soil",
                "water_source": "Drainage Creeks",
                "crop_history": "Loblolly Pine (Planted 2015)",
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
                "title": "A Guide to Buying Land and Inspecting Soil Types",
                "excerpt": "Discover what to look for when inspecting acreage, understanding loam, clay, and sandy soil properties.",
                "content": "Before buying land, the soil is one of the most critical aspects. Loam is the ideal agricultural soil, while rocky or clay soils require specific foundations. Always run a soil test or check government soil survey maps to analyze drainage, composition, and crop compatibility.",
                "image_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
                "author_name": "Land Team",
                "is_published": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Understanding Water Rights & Mineral Rights on Rural Land",
                "excerpt": "Learn how water rights and mineral rights impact your land ownership and investment value.",
                "content": "Water is gold on acreage. Whether it is senior riparian rights or groundwater permits, understand what rights come with the deed. Separately, make sure to verify if the seller retains mineral rights, which can affect oil, gas, or timber drilling operations on the property.",
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
    return {"message": "Land.com Clone API", "version": "1.0.0", "tagline": "Pure Earth, Beautiful Land"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

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
