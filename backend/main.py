from fastapi import FastAPI, Depends, HTTPException, Form, File, UploadFile
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import FileResponse
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import pandas as pd
import os
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# تنظیمات دیتابیس
DATABASE_URL = "postgresql://postgres:mypassword@localhost/royal_jeans"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# تنظیمات JWT
SECRET_KEY = "f7c3a9d2e4b8f6c1d5e7a0b9c2d4e6f8a1b3c5d7e9f0a2b4c6d8e0f1a3b5c7d9"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# تنظیمات FastAPI
app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # اضافه کردن پورت 3001
    allow_credentials=True,
    allow_methods=["*"],  # همه متدها (GET, POST, ...)
    allow_headers=["*"],  # همه هدرها (مثل Authorization)
)
# مدل‌های دیتابیس
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    avatar = Column(String, nullable=True)

class Permission(Base):
    __tablename__ = "permissions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    permission = Column(String)

class ProductCode(Base):
    __tablename__ = "product_codes"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String)  # دسته
    category_code = Column(String)
    material = Column(String)  # جنس
    material_code = Column(String)
    model = Column(String)
    model_code = Column(String)
    style1 = Column(String)
    style1_code = Column(String)
    style2 = Column(String)
    style2_code = Column(String)
    style3 = Column(String)
    style3_code = Column(String)
    style4 = Column(String)
    style4_code = Column(String)
    weight = Column(String)
    weight_code = Column(String)
    length = Column(String)
    length_code = Column(String)
    color = Column(String)
    color_code = Column(String)
    fabric = Column(String)
    fabric_code = Column(String)
    size = Column(String)
    size_code = Column(String)

class ProductLog(Base):
    __tablename__ = "product_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_name = Column(String)
    product_code = Column(String)
    additional_code = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")

# ایجاد جداول
Base.metadata.create_all(bind=engine)

# توابع کمکی
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="کاربر معتبر نیست")
    except JWTError:
        raise HTTPException(status_code=401, detail="کاربر معتبر نیست")
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="کاربر یافت نشد")
    return user

def get_user_permissions(user: User, db: Session):
    permissions = db.query(Permission).filter(Permission.user_id == user.id).all()
    return [p.permission for p in permissions]

# مسیرهای API
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="نام کاربری یا رمز عبور اشتباه است")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/generate_product")
async def generate_product(code: str = Form(...), additional_code: str = Form(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if len(code) != 29:
        raise HTTPException(status_code=400, detail="کد باید 29 رقم باشد")

    # گرفتن هر بخش کد
    category_code = code[0:2]    # 2 رقم
    material_code = code[2:4]    # 2 رقم
    model_code = code[4:7]       # 3 رقم
    style1_code = code[7:9]      # 2 رقم
    style2_code = code[9:11]     # 2 رقم
    style3_code = code[11:13]    # 2 رقم
    style4_code = code[13:15]    # 2 رقم
    weight_code = code[15:16]    # 1 رقم
    length_code = code[16:18]    # 2 رقم
    color_code = code[18:21]     # 3 رقم
    fabric_code = code[21:23]    # 2 رقم
    size_code = code[23:25]      # 2 رقم

    # چک کردن هر بخش
    category_row = db.query(ProductCode).filter(ProductCode.category_code == category_code).first()
    material_row = db.query(ProductCode).filter(ProductCode.material_code == material_code).first()
    model_row = db.query(ProductCode).filter(ProductCode.model_code == model_code).first()
    style1_row = db.query(ProductCode).filter(ProductCode.style1_code == style1_code).first()
    style2_row = db.query(ProductCode).filter(ProductCode.style2_code == style2_code).first()
    style3_row = db.query(ProductCode).filter(ProductCode.style3_code == style3_code).first()
    style4_row = db.query(ProductCode).filter(ProductCode.style4_code == style4_code).first()
    weight_row = db.query(ProductCode).filter(ProductCode.weight_code == weight_code).first()
    length_row = db.query(ProductCode).filter(ProductCode.length_code == length_code).first()
    color_row = db.query(ProductCode).filter(ProductCode.color_code == color_code).first()
    fabric_row = db.query(ProductCode).filter(ProductCode.fabric_code == fabric_code).first()
    size_row = db.query(ProductCode).filter(ProductCode.size_code == size_code).first()

    # چک کردن خطاها
    if not all([category_row, material_row, model_row, style1_row, style2_row, style3_row, style4_row, weight_row, length_row, color_row, fabric_row, size_row]):
        missing = []
        if not category_row:
            missing.append(f"category_code: {category_code}")
        if not material_row:
            missing.append(f"material_code: {material_code}")
        if not model_row:
            missing.append(f"model_code: {model_code}")
        if not style1_row:
            missing.append(f"style1_code: {style1_code}")
        if not style2_row:
            missing.append(f"style2_code: {style2_code}")
        if not style3_row:
            missing.append(f"style3_code: {style3_code}")
        if not style4_row:
            missing.append(f"style4_code: {style4_code}")
        if not weight_row:
            missing.append(f"weight_code: {weight_code}")
        if not length_row:
            missing.append(f"length_code: {length_code}")
        if not color_row:
            missing.append(f"color_code: {color_code}")
        if not fabric_row:
            missing.append(f"fabric_code: {fabric_code}")
        if not size_row:
            missing.append(f"size_code: {size_code}")
        raise HTTPException(status_code=400, detail=f"کدهای نامعتبر: {', '.join(missing)}")

    # ساخت نام محصول
    product_name = f"{category_row.category} {material_row.material} {model_row.model} {style1_row.style1} {style2_row.style2} {style3_row.style3} {style4_row.style4} {weight_row.weight} قد {length_row.length} {color_row.color} {fabric_row.fabric} {size_row.size}"

    # ذخیره در لاگ
    product_log = ProductLog(
        user_id=user.id,
        product_name=product_name,
        product_code=code,
        additional_code=additional_code
    )
    db.add(product_log)
    db.commit()

    return {"product_name": f"{product_name} {additional_code}"}
    # ذخیره در لاگ
    product_log = ProductLog(
        user_id=user.id,
        product_name=full_name,
        product_code=code,
        additional_code=additional_code
    )
    db.add(product_log)
    db.commit()

    return {"product_name": full_name}

@app.get("/products", response_model=List[dict])
async def get_products(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    products = db.query(ProductLog).filter(ProductLog.user_id == user.id).all()
    return [
        {
            "id": product.id,
            "product_name": product.product_name,
            "product_code": product.product_code,
            "additional_code": product.additional_code,
            "created_at": product.created_at
        }
        for product in products
    ]
@app.post("/add_product_code")
async def add_product_code(
    category: str = Form(...),
    category_code: str = Form(...),
    material: str = Form(...),
    material_code: str = Form(...),
    model: str = Form(...),
    model_code: str = Form(...),
    style1: str = Form(...),
    style1_code: str = Form(...),
    style2: str = Form(...),
    style2_code: str = Form(...),
    style3: str = Form(...),
    style3_code: str = Form(...),
    style4: str = Form(...),
    style4_code: str = Form(...),
    weight: str = Form(...),
    weight_code: str = Form(...),
    length: str = Form(...),
    length_code: str = Form(...),
    color: str = Form(...),
    color_code: str = Form(...),
    fabric: str = Form(...),
    fabric_code: str = Form(...),
    size: str = Form(...),
    size_code: str = Form(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if "admin" not in get_user_permissions(user, db):
        raise HTTPException(status_code=403, detail="دسترسی ندارید")

    product_code = ProductCode(
        category=category,
        category_code=category_code,
        material=material,
        material_code=material_code,
        model=model,
        model_code=model_code,
        style1=style1,
        style1_code=style1_code,
        style2=style2,
        style2_code=style2_code,
        style3=style3,
        style3_code=style3_code,
        style4=style4,
        style4_code=style4_code,
        weight=weight,
        weight_code=weight_code,
        length=length,
        length_code=length_code,
        color=color,
        color_code=color_code,
        fabric=fabric,
        fabric_code=fabric_code,
        size=size,
        size_code=size_code
    )
    db.add(product_code)
    db.commit()
    return {"message": "مقدار جدید اضافه شد"}

@app.get("/export_db")
async def export_db(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if "admin" not in get_user_permissions(user, db):
        raise HTTPException(status_code=403, detail="دسترسی ندارید")

    codes = db.query(ProductCode).all()
    data = [{
        "دسته": c.category,
        "کد دسته": c.category_code,
        "جنس": c.material,
        "کد جنس": c.material_code,
        "مدل": c.model,
        "کد مدل": c.model_code,
        "استایل 1": c.style1,
        "کد استایل 1": c.style1_code,
        "استایل 2": c.style2,
        "کد استایل 2": c.style2_code,
        "استایل 3": c.style3,
        "کد استایل 3": c.style3_code,
        "استایل 4": c.style4,
        "کد استایل 4": c.style4_code,
        "گرم": c.weight,
        "کد گرم": c.weight_code,
        "قد": c.length,
        "کد قد": c.length_code,
        "رنگ": c.color,
        "کد رنگ": c.color_code,
        "پارچه": c.fabric,
        "کد پارچه": c.fabric_code,
        "سایز": c.size,
        "کد سایز": c.size_code
    } for c in codes]

    df = pd.DataFrame(data)
    df.to_excel("product_codes.xlsx", index=False)
    return FileResponse("product_codes.xlsx", filename="product_codes.xlsx")

@app.get("/product_logs")
async def get_product_logs(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if "admin" not in get_user_permissions(user, db):
        raise HTTPException(status_code=403, detail="دسترسی ندارید")

    logs = db.query(ProductLog).all()
    return [{
        "user": f"{log.user.first_name} {log.user.last_name}",
        "product_name": log.product_name,
        "created_at": log.created_at
    } for log in logs]

@app.post("/create_user")
async def create_user(
    first_name: str = Form(...),
    last_name: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    permissions: list = Form(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if "admin" not in get_user_permissions(user, db):
        raise HTTPException(status_code=403, detail="دسترسی ندارید")

    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="نام کاربری قبلاً ثبت شده")

    hashed_password = get_password_hash(password)
    new_user = User(
        first_name=first_name,
        last_name=last_name,
        username=username,
        password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    for perm in permissions:
        db.add(Permission(user_id=new_user.id, permission=perm))
    db.commit()

    return {"message": "کاربر جدید ایجاد شد"}

@app.post("/update_profile")
async def update_profile(
    first_name: str = Form(...),
    last_name: str = Form(...),
    password: str = Form(None),
    avatar: UploadFile = File(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user.first_name = first_name
    user.last_name = last_name
    if password:
        user.password = get_password_hash(password)
    if avatar:
        os.makedirs("static/avatars", exist_ok=True)
        avatar_path = f"static/avatars/{user.id}_{avatar.filename}"
        with open(avatar_path, "wb") as f:
            f.write(await avatar.read())
        user.avatar = avatar_path
    db.commit()
    return {"message": "پروفایل به‌روزرسانی شد"}


@app.get("/users/me")
async def read_users_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    permissions = get_user_permissions(user, db)
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "username": user.username,
        "avatar": user.avatar,
        "permissions": permissions
    }