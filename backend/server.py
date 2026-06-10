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
JWT_SECRET = os.environ.get('JWT_SECRET', 'makemypropertyz-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

app = FastAPI(title="SriSuktam Organics API")

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
    await db.initialize(MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB)
    logger.info("MySQL Connection and Tables Initialized Successfully.")

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

# Property Models (Adapted for Farming Lands)
class PropertyBase(BaseModel):
    title: str
    description: Optional[str] = None
    property_type: str = "farming_land"  # default to farming land
    property_subtype: str  # orchard, plantation, agricultural, dry_land, wet_land
    price: float
    price_type: str = "sale"  # sale, rent
    city: str
    area: str
    address: Optional[str] = None
    bedrooms: Optional[int] = 0
    bathrooms: Optional[int] = 0
    area_sqft: Optional[float] = None
    images: List[str] = []
    amenities: List[str] = []
    floor_plan_url: Optional[str] = None
    virtual_tour_url: Optional[str] = None
    builder_name: Optional[str] = None
    builder_info: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    
    # Farming Land Specific Attributes
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
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
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
        min_price=min_price,
        max_price=max_price,
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

@api_router.get("/properties/{property_id}")
async def get_property(property_id: str):
    prop = await db.get_property_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Land not found")
    return prop

# ==================== INTEREST ROUTES (NO AUTH REQUIRED) ====================

@api_router.post("/properties/interest")
async def submit_interest(interest_data: InterestCreate):
    """Submit interest in a property/land - NO LOGIN REQUIRED"""
    # Verify property exists
    prop = await db.get_property_by_id(interest_data.property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Land listing not found")
    
    # Check if this email already expressed interest
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
    
    # Update interest count
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
    """Upload an image file and return the URL"""
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
    """Upload multiple image files and return their URLs"""
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
    """Upload a video file and return the URL"""
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
    """Seed initial data including admin user and sample organic lands"""
    try:
        results = {}
        
        # Check if admin already exists
        admin_exists = await db.get_user_by_email("admin@makemypropertyz.com")
        if not admin_exists:
            admin_user = {
                "id": str(uuid.uuid4()),
                "email": "admin@makemypropertyz.com",
                "name": "SriSuktam Admin",
                "phone": "+919876543210",
                "password": hash_password("admin123"),
                "role": "admin",
                "created_at": datetime.now(timezone.utc)
            }
            await db.create_user(admin_user)
            results["admin"] = "Created"
        else:
            results["admin"] = "Already exists"
            
        # Optional: Seed matching srisuktam email for branding
        srisuktam_admin = await db.get_user_by_email("admin@srisuktamorganics.com")
        if not srisuktam_admin:
            admin_user_2 = {
                "id": str(uuid.uuid4()),
                "email": "admin@srisuktamorganics.com",
                "name": "SriSuktam Admin",
                "phone": "+919876543210",
                "password": hash_password("admin123"),
                "role": "admin",
                "created_at": datetime.now(timezone.utc)
            }
            await db.create_user(admin_user_2)
            results["srisuktam_admin"] = "Created"
        
        # Reset properties and blogs
        await db.delete_all_properties_and_blogs()
        
        # Seed organic farming lands
        sample_lands = [
            {
                "id": str(uuid.uuid4()),
                "title": "SriSuktam Nallamala Foothills | Organic Mango Orchard",
                "description": "Exquisite established organic Mango orchard of Kesar and Alphonso varieties. Situated at the fertile foothills of Nallamala, surrounded by protected forest lands. Features mature crop bearing trees, certified chemical-free soil, complete fencing, and round-the-clock water supply from a dedicated borewell.",
                "property_type": "farming_land",
                "property_subtype": "orchard",
                "price": 12000000.0,
                "price_type": "sale",
                "city": "Mahabubnagar",
                "area": "Nallamala Foothills",
                "address": "Survey No 442, Nallamala Valley, Achampet Road",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 239580.0, # 5.5 Acres in SqFt
                "images": [
                    "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=900",
                    "https://images.unsplash.com/photo-1628189679199-31ff97920ab7?w=900",
                    "https://images.unsplash.com/photo-1598114092590-34907153a8ae?w=900",
                    "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=900"
                ],
                "amenities": ["Borewell Water Source", "Electric Fencing", "Organic Certified Soil", "Tar Road Access", "Worker Shed"],
                "floor_plan_url": "",
                "virtual_tour_url": "",
                "builder_name": "SriSuktam Lands",
                "builder_info": "Certified organic land specialists focusing on high-yield farming plots.",
                "is_featured": True,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "interest_count": 0,
                "soil_type": "Red Clay Soil",
                "water_source": "Borewell & Stream",
                "crop_history": "Organic Mango (10 years), Turmeric intercropping",
                "fencing": "Fully Fenced",
                "road_width_ft": 24,
                "video_url": "https://cdn.pixabay.com/video/2021/08/04/83861-584742517_large.mp4"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "SriSuktam Western Ghats Valley | Natural Spice Plantation",
                "description": "Earthy, pristine spice valley plantation specializing in Cardamom, Black Pepper, and Robusta Coffee. Surrounded by dense forest canopy with rich organic humus. Natural mountain stream runs directly through the plot, feeding the plantation year-round. Perfect for eco-farming or premium plantation retreat.",
                "property_type": "farming_land",
                "property_subtype": "plantation",
                "price": 18500000.0,
                "price_type": "sale",
                "city": "Wayanad",
                "area": "Meppadi Valley",
                "address": "Survey No 108/3, Vythiri-Meppadi Road",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 174240.0, # 4 Acres in SqFt
                "images": [
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900",
                    "https://images.unsplash.com/photo-1524147055964-b52e3e4a2e58?w=900",
                    "https://images.unsplash.com/photo-1522002166668-3e4b7c6b5b54?w=900",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900"
                ],
                "amenities": ["Perennial Mountain Stream", "Stone Boundary Walls", "Rich Forest Humus", "Jeep Access Track", "Solar Power System"],
                "floor_plan_url": "",
                "virtual_tour_url": "",
                "builder_name": "SriSuktam Lands",
                "builder_info": "Pioneers in eco-plantations and sustainable agroforestry models.",
                "is_featured": True,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "interest_count": 0,
                "soil_type": "Forest Humus & Loamy Soil",
                "water_source": "Perennial Mountain Stream",
                "crop_history": "Cardamom, Pepper, Robusta Coffee",
                "fencing": "Natural Stone Wall",
                "road_width_ft": 16,
                "video_url": "https://cdn.pixabay.com/video/2021/08/04/83861-584742517_large.mp4"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "SriSuktam Cauvery Basin | Organic Paddy Land",
                "description": "Highly fertile alluvial clay farming land with active canal irrigation from the Cauvery river basin. Ideally suited for traditional organic paddy (Sona Masuri, Black Rice). Equipped with free agricultural electricity connection and high flow motor system. Excellent connectivity to major state highways.",
                "property_type": "farming_land",
                "property_subtype": "agricultural",
                "price": 7500000.0,
                "price_type": "sale",
                "city": "Mysore",
                "area": "Cauvery Basin",
                "address": "Survey No 211, Cauvery Canal Road, T. Narasipura",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 130680.0, # 3 Acres in SqFt
                "images": [
                    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900",
                    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900",
                    "https://images.unsplash.com/photo-1533604106052-1d547f311c6d?w=900",
                    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900"
                ],
                "amenities": ["Cauvery Canal Water", "Free Agricultural Power", "Paddy Fields Infrastructure", "All-Weather Mud Road", "Pump House"],
                "floor_plan_url": "",
                "virtual_tour_url": "",
                "builder_name": "SriSuktam Lands",
                "builder_info": "Specialists in fertile river basin agricultural lands.",
                "is_featured": False,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "interest_count": 0,
                "soil_type": "River Alluvial Clay Soil",
                "water_source": "Cauvery River Canal",
                "crop_history": "Organic Paddy, Black Gram rotation",
                "fencing": "Partially Fenced",
                "road_width_ft": 20,
                "video_url": "https://cdn.pixabay.com/video/2021/08/04/83861-584742517_large.mp4"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Nature Lands Majestic Tea Estate | Nilgiris",
                "description": "Breathtaking premium tea estate nestled in the misty Nilgiri hills. Offers panoramic mountain views, established high-yield tea bushes, and a colonial-era manager's bungalow. Perfect for a luxury plantation retreat or commercial organic tea production.",
                "property_type": "farming_land",
                "property_subtype": "plantation",
                "price": 45000000.0,
                "price_type": "sale",
                "city": "Ooty",
                "area": "Nilgiri Hills",
                "address": "Survey No 45, Wellington Road",
                "bedrooms": 3,
                "bathrooms": 2,
                "area_sqft": 435600.0,
                "images": [
                    "https://images.unsplash.com/photo-1594900161121-705b0b29841c?w=900",
                    "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=900",
                    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900",
                    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=900"
                ],
                "amenities": ["Natural Spring Water", "Heritage Bungalow", "Processing Shed", "Hilltop View", "Staff Quarters"],
                "floor_plan_url": "",
                "virtual_tour_url": "",
                "builder_name": "Nature Lands",
                "builder_info": "Specialists in premium high-altitude plantations.",
                "is_featured": False,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "interest_count": 0,
                "soil_type": "Red Laterite Soil",
                "water_source": "Natural Spring",
                "crop_history": "Organic Black Tea",
                "fencing": "Natural Hedge",
                "road_width_ft": 15,
                "video_url": "https://cdn.pixabay.com/video/2021/08/04/83861-584742517_large.mp4"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Nature Lands Coastal Coconut Grove | Kerala Backwaters",
                "description": "Stunning coastal property featuring mature, high-yielding coconut palms right on the edge of the serene Kerala backwaters. Incredible potential for an eco-resort or sustainable coastal farming.",
                "property_type": "farming_land",
                "property_subtype": "orchard",
                "price": 28000000.0,
                "price_type": "sale",
                "city": "Alleppey",
                "area": "Backwaters",
                "address": "Plot 12, Lake View Road",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 87120.0,
                "images": [
                    "https://images.unsplash.com/photo-1596431940989-1065b719463c?w=900",
                    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900",
                    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900",
                    "https://images.unsplash.com/photo-1522002166668-3e4b7c6b5b54?w=900"
                ],
                "amenities": ["Backwater Frontage", "Boat Access", "Fresh Water Well", "Ferry Connectivity"],
                "floor_plan_url": "",
                "virtual_tour_url": "",
                "builder_name": "Nature Lands",
                "builder_info": "Experts in coastal and waterfront agricultural properties.",
                "is_featured": False,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "interest_count": 0,
                "soil_type": "Coastal Sandy Loam",
                "water_source": "Fresh Water Well",
                "crop_history": "Coconut & Areca Nut",
                "fencing": "Chain Link",
                "road_width_ft": 12,
                "video_url": "https://cdn.pixabay.com/video/2021/08/04/83861-584742517_large.mp4"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Nature Lands Highland Coffee Estate | Coorg",
                "description": "Lush green Arabica coffee estate surrounded by towering silver oak trees. Includes a natural waterfall, abundant birdlife, and a fully functional coffee drying yard. A true paradise for nature lovers and investors alike.",
                "property_type": "farming_land",
                "property_subtype": "plantation",
                "price": 32000000.0,
                "price_type": "sale",
                "city": "Coorg",
                "area": "Madikeri",
                "address": "Estate No 9, Abbey Falls Road",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 217800.0,
                "images": [
                    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=900",
                    "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=900",
                    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900",
                    "https://images.unsplash.com/photo-1533604106052-1d547f311c6d?w=900"
                ],
                "amenities": ["Private Waterfall", "Silver Oak Timber", "Drying Yard", "Main Road Access"],
                "floor_plan_url": "",
                "virtual_tour_url": "",
                "builder_name": "Nature Lands",
                "builder_info": "Premium estate curators in the Western Ghats.",
                "is_featured": False,
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "interest_count": 0,
                "soil_type": "Forest Humus",
                "water_source": "Waterfall & Stream",
                "crop_history": "Arabica Coffee & Pepper",
                "fencing": "Barbed Wire",
                "road_width_ft": 20,
                "video_url": "https://cdn.pixabay.com/video/2021/08/04/83861-584742517_large.mp4"
            }
        ]
        
        await db.insert_properties(sample_lands)
        results["properties"] = "Seeded"
        
        # Seed organic farming blogs
        sample_blogs = [
            {
                "id": str(uuid.uuid4()),
                "title": "A Guide to Traditional Organic Farming in Southern India",
                "excerpt": "Discover the age-old techniques that preserve soil health and yield pure organic crops.",
                "content": "Traditional Indian farming practices are inherently sustainable and focus deeply on soil fertility. In Southern India, farmers have long practiced crop rotation and utilized green manures to maintain soil structure.\n\nKey traditional practices:\n1. Jeevamrutha Application: A microbial culture prepared from cow dung, urine, and jaggery that multiplies beneficial soil bacteria.\n2. Mixed Cropping: Growing legumes alongside major crops like millets or sugarcane to naturally fix nitrogen in the soil.\n3. Water Conservation: Multi-tier planting systems in plantations that shade soil, preventing water evaporation.",
                "image_url": "https://images.unsplash.com/photo-1593113630400-ea4288922497?w=800",
                "author_name": "SriSuktam Agronomist",
                "is_published": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Why Buying Organic Farming Land is the Best Long-term Investment",
                "excerpt": "Understand the economics and environmental benefits of investing in chemical-free agricultural land.",
                "content": "As modern consumers increasingly seek chemical-free, nutrient-dense organic foods, the demand for certified organic farming land is skyrocketing. Beyond pure economic ROI, investing in land is a step toward sustainability.\n\nBenefits of Organic Land Investment:\n1. Premium Asset Appreciation: Unpolluted land with verified organic soil commands a significant premium in the market.\n2. Passive Income: Lease out lands to certified organic farmers or run agro-forestry models (like sandalwood or teak orchards) for massive long-term yields.\n3. Water Security: Organic farming improves the soil's water-holding capacity, recharging groundwater levels over time.",
                "image_url": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
                "author_name": "Land Investment Team",
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
    return {"message": "SriSuktam Organics API", "version": "1.0.0", "tagline": "Pure Earth, Healthy Life"}

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
