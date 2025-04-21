from fastapi import FastAPI, Depends, HTTPException, Form, File, UploadFile
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
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
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict
import json
import asyncio
import uuid
from sqlalchemy import Boolean

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
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for file downloads
app.mount("/static", StaticFiles(directory="static"), name="static")

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
    category = Column(String)
    category_code = Column(String)
    material = Column(String)
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

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(String, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    text = Column(String, nullable=True)
    file_url = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)
    sender = relationship("User", foreign_keys=[sender_id])
    recipient = relationship("User", foreign_keys=[recipient_id])

Base.metadata.create_all(bind=engine)

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
    category_code = code[0:2]
    material_code = code[2:4]
    model_code = code[4:7]
    style1_code = code[7:9]
    style2_code = code[9:11]
    style3_code = code[11:13]
    style4_code = code[13:15]
    weight_code = code[15:16]
    length_code = code[16:18]
    color_code = code[18:21]
    fabric_code = code[21:23]
    size_code = code[23:25]
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
    product_name = f"{category_row.category} {material_row.material} {model_row.model} {style1_row.style1} {style2_row.style2} {style3_row.style3} {style4_row.style4} {weight_row.weight} قد {length_row.length} {color_row.color} {fabric_row.fabric} {size_row.size}"
    full_name = f"{product_name} {additional_code}"
    product_log = ProductLog(
        user_id=user.id,
        product_name=product_name,
        product_code=code,
        additional_code=additional_code
    )
    db.add(product_log)
    db.commit()
    return {"product_name": full_name}

@app.get("/products", response_model=List[dict])
async def get_products(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    products = db.query(ProductLog).filter(ProductLog.user_id == user.id).order_by(ProductLog.created_at.desc()).all()
    return [
        {
            "id": product.id,
            "product_name": product.product_name,
            "product_code": product.product_code,
            "additional_code": product.additional_code,
            "created_at": product.created_at.isoformat()
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
    os.makedirs("exports", exist_ok=True)
    file_path = "exports/product_codes.xlsx"
    df.to_excel(file_path, index=False)
    return FileResponse(file_path, filename="product_codes.xlsx")

@app.get("/product_logs")
async def get_product_logs(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if "admin" not in get_user_permissions(user, db):
        raise HTTPException(status_code=403, detail="دسترسی ندارید")
    logs = db.query(ProductLog).options(relationship(User)).order_by(ProductLog.created_at.desc()).all()
    return [{
        "user": f"{log.user.first_name} {log.user.last_name}" if log.user else "کاربر نامشخص",
        "product_name": log.product_name,
        "product_code": log.product_code,
        "additional_code": log.additional_code,
        "created_at": log.created_at.isoformat()
    } for log in logs]

@app.post("/create_user")
async def create_user(
    first_name: str = Form(...),
    last_name: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    permissions: List[str] = Form(...),
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

@app.post("/update_password")
async def update_password(
    current_password: str = Form(...),
    new_password: str = Form(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not pwd_context.verify(current_password, user.password):
        raise HTTPException(status_code=400, detail="رمز عبور فعلی نادرست است")
    user.password = get_password_hash(new_password)
    db.commit()
    return {"message": "رمز عبور با موفقیت به‌روزرسانی شد"}

@app.post("/update_profile")
async def update_profile(
    first_name: str = Form(...),
    last_name: str = Form(...),
    avatar: UploadFile = File(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        user.first_name = first_name
        user.last_name = last_name
        if avatar:
            os.makedirs("static/avatars", exist_ok=True)
            file_extension = os.path.splitext(avatar.filename)[1]
            avatar_filename = f"{user.id}_{int(datetime.now().timestamp())}{file_extension}"
            avatar_path = os.path.join("static/avatars", avatar_filename)
            with open(avatar_path, "wb") as f:
                content = await avatar.read()
                f.write(content)
            user.avatar = avatar_path
        db.commit()
        db.refresh(user)
        return {
            "status": "success",
            "message": "پروفایل به‌روزرسانی شد",
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username,
                "avatar": user.avatar
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

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

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}
        self.authenticated_users: Dict[int, int] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        await self.send_chat_history(user_id)
        await self.broadcast_online_users()

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            self.authenticated_users = {k: v for k, v in self.authenticated_users.items() if v != user_id}
            asyncio.create_task(self.broadcast_online_users())

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(json.dumps(message))

    async def broadcast(self, message: dict):
        for connection in self.active_connections.values():
            await connection.send_text(json.dumps(message))

    async def broadcast_online_users(self):
        db = SessionLocal()
        try:
            online_users = []
            for user_id in self.active_connections:
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    online_users.append({
                        "id": user.id,
                        "username": user.username,
                        "first_name": user.first_name or user.username,
                        "last_name": user.last_name or "",
                        "avatar": user.avatar
                    })
            await self.broadcast({
                "type": "online_users",
                "users": online_users
            })
        finally:
            db.close()

    async def send_chat_history(self, user_id: int):
        db = SessionLocal()
        try:
            # Load public messages
            public_messages = db.query(ChatMessage).filter(ChatMessage.recipient_id == None).order_by(ChatMessage.timestamp.asc()).all()
            for msg in public_messages:
                await self.send_personal_message({
                    "type": "public_message",
                    "message": {
                        "id": msg.id,
                        "text": msg.text,
                        "sender": {
                            "id": msg.sender.id,
                            "username": msg.sender.username,
                            "first_name": msg.sender.first_name or msg.sender.username,
                            "last_name": msg.sender.last_name or "",
                            "avatar": msg.sender.avatar
                        },
                        "timestamp": msg.timestamp.isoformat()
                    }
                }, user_id)

            # Load private messages
            private_messages = db.query(ChatMessage).filter(
                (ChatMessage.sender_id == user_id) | (ChatMessage.recipient_id == user_id)
            ).order_by(ChatMessage.timestamp.asc()).all()
            for msg in private_messages:
                message_data = {
                    "type": "private_message" if msg.text else "file_message",
                    "message": {
                        "id": msg.id,
                        "text": msg.text,
                        "fileUrl": msg.file_url,
                        "fileName": os.path.basename(msg.file_url) if msg.file_url else None,
                        "fileType": None,  # Will be set in file_message handler
                        "sender": {
                            "id": msg.sender.id,
                            "username": msg.sender.username,
                            "first_name": msg.sender.first_name or msg.sender.username,
                            "last_name": msg.sender.last_name or "",
                            "avatar": msg.sender.avatar
                        },
                        "timestamp": msg.timestamp.isoformat(),
                        "read": msg.is_read
                    }
                }
                if msg.recipient_id:
                    message_data["message"]["recipient"] = {
                        "id": msg.recipient.id,
                        "username": msg.recipient.username,
                        "first_name": msg.recipient.first_name or msg.recipient.username,
                        "last_name": msg.recipient.last_name or "",
                        "avatar": msg.recipient.avatar
                    }
                await self.send_personal_message(message_data, user_id)
        finally:
            db.close()

manager = ConnectionManager()

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    print(f"WebSocket connection attempt for user_id: {user_id}")
    await manager.connect(websocket, user_id)
    file_data = None
    try:
        while True:
            data = await websocket.receive()
            if "bytes" in data:
                file_data = data["bytes"]
                print(f"Received file bytes for user_id {user_id}, size: {len(file_data)}")
                continue
            if "text" in data:
                message_data = json.loads(data["text"])
                print(f"Received message from user_id {user_id}: {message_data}")
                if message_data["type"] == "authenticate":
                    db = SessionLocal()
                    try:
                        token = message_data.get("token")
                        print(f"Authentication attempt for user_id {user_id} with token: {token}")
                        if not token:
                            print(f"No token provided for user_id {user_id}")
                            await manager.send_personal_message({
                                "type": "error",
                                "message": "No token provided"
                            }, user_id)
                            await websocket.close()
                            continue
                        try:
                            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                            username = payload.get("sub")
                            user = db.query(User).filter(User.username == username).first()
                            if not user or user.id != user_id:
                                print(f"Invalid token for user_id {user_id}, username: {username}")
                                await manager.send_personal_message({
                                    "type": "error",
                                    "message": "Invalid token"
                                }, user_id)
                                await websocket.close()
                                continue
                            manager.authenticated_users[user_id] = user_id
                            print(f"User {user_id} authenticated successfully")
                        except JWTError as e:
                            print(f"JWTError for user_id {user_id}: {str(e)}")
                            await manager.send_personal_message({
                                "type": "error",
                                "message": "Invalid token"
                            }, user_id)
                            await websocket.close()
                            continue
                    finally:
                        db.close()
                elif user_id not in manager.authenticated_users:
                    print(f"User {user_id} not authenticated")
                    await manager.send_personal_message({
                        "type": "error",
                        "message": "Not authenticated"
                    }, user_id)
                    await websocket.close()
                    continue
                elif message_data["type"] == "public_message":
                    db = SessionLocal()
                    try:
                        user = db.query(User).filter(User.id == user_id).first()
                        if not user:
                            print(f"User not found: {user_id}")
                            await manager.send_personal_message({
                                "type": "error",
                                "message": "User not found"
                            }, user_id)
                            continue
                        message_id = str(uuid.uuid4())
                        timestamp = message_data["message"].get("timestamp") or datetime.utcnow().isoformat()
                        db_message = ChatMessage(
                            id=message_id,
                            sender_id=user_id,
                            text=message_data["message"]["text"],
                            timestamp=datetime.fromisoformat(timestamp) if isinstance(timestamp, str) else timestamp
                        )
                        db.add(db_message)
                        db.commit()
                        print(f"Public message saved: {message_id} from user_id {user_id}")
                        await manager.broadcast({
                            "type": "public_message",
                            "message": {
                                "id": message_id,
                                "text": message_data["message"]["text"],
                                "sender": {
                                    "id": user.id,
                                    "username": user.username,
                                    "first_name": user.first_name or user.username,
                                    "last_name": user.last_name or "",
                                    "avatar": user.avatar
                                },
                                "timestamp": timestamp
                            }
                        })
                    finally:
                        db.close()
                elif message_data["type"] == "private_message":
                    db = SessionLocal()
                    try:
                        user = db.query(User).filter(User.id == user_id).first()
                        recipient = db.query(User).filter(User.id == message_data["message"]["recipientId"]).first()
                        if not user or not recipient:
                            print(f"User or recipient not found for user_id {user_id}, recipient_id {message_data['message']['recipientId']}")
                            await manager.send_personal_message({
                                "type": "error",
                                "message": "User or recipient not found"
                            }, user_id)
                            continue
                        message_id = str(uuid.uuid4())
                        timestamp = message_data["message"].get("timestamp") or datetime.utcnow().isoformat()
                        db_message = ChatMessage(
                            id=message_id,
                            sender_id=user_id,
                            recipient_id=recipient.id,
                            text=message_data["message"]["text"],
                            timestamp=datetime.fromisoformat(timestamp) if isinstance(timestamp, str) else timestamp
                        )
                        db.add(db_message)
                        db.commit()
                        print(f"Private message saved: {message_id} from user_id {user_id} to recipient_id {recipient.id}")
                        message_data_response = {
                            "type": "private_message",
                            "message": {
                                "id": message_id,
                                "text": message_data["message"]["text"],
                                "sender": {
                                    "id": user.id,
                                    "username": user.username,
                                    "first_name": user.first_name or user.username,
                                    "last_name": user.last_name or "",
                                    "avatar": user.avatar
                                },
                                "recipient": {
                                    "id": recipient.id,
                                    "username": recipient.username,
                                    "first_name": recipient.first_name or recipient.username,
                                    "last_name": recipient.last_name or "",
                                    "avatar": recipient.avatar
                                },
                                "timestamp": timestamp,
                                "read": False
                            }
                        }
                        await manager.send_personal_message(message_data_response, user_id)
                        if recipient.id in manager.active_connections:
                            await manager.send_personal_message(message_data_response, recipient.id)
                    finally:
                        db.close()
                elif message_data["type"] == "file_message":
                    db = SessionLocal()
                    try:
                        user = db.query(User).filter(User.id == user_id).first()
                        recipient_id = message_data["message"].get("recipientId")
                        recipient = db.query(User).filter(User.id == recipient_id).first() if recipient_id else None
                        if not user or (recipient_id and not recipient):
                            print(f"User or recipient not found for user_id {user_id}, recipient_id {recipient_id}")
                            await manager.send_personal_message({
                                "type": "error",
                                "message": "User or recipient not found"
                            }, user_id)
                            continue
                        if not file_data:
                            print(f"No file data received for file_message from user_id {user_id}")
                            await manager.send_personal_message({
                                "type": "error",
                                "message": "No file data received"
                            }, user_id)
                            continue
                        # Save file
                        max_file_size = 10 * 1024 * 1024  # 10MB
                        if len(file_data) > max_file_size:
                            print(f"File size exceeds limit for user_id {user_id}")
                            await manager.send_personal_message({
                                "type": "error",
                                "message": "File size exceeds 10MB limit"
                            }, user_id)
                            continue
                        allowed_types = ["image/jpeg", "image/png", "application/pdf", "text/plain"]
                        if message_data["message"]["fileType"] not in allowed_types:
                            print(f"Unsupported file type for user_id {user_id}: {message_data['message']['fileType']}")
                            await manager.send_personal_message({
                                "type": "error",
                                "message": "Unsupported file type"
                            }, user_id)
                            continue
                        from pathlib import Path
                        file_name = Path(message_data["message"]["fileName"]).name
                        file_extension = os.path.splitext(file_name)[1]
                        file_id = str(uuid.uuid4())
                        file_path = f"static/chat_files/{file_id}{file_extension}"
                        os.makedirs("static/chat_files", exist_ok=True)
                        with open(file_path, "wb") as f:
                            f.write(file_data)
                        # Save message
                        message_id = str(uuid.uuid4())
                        timestamp = datetime.utcnow().isoformat()
                        db_message = ChatMessage(
                            id=message_id,
                            sender_id=user_id,
                            recipient_id=recipient_id,
                            text=None,
                            file_url=file_path,
                            timestamp=datetime.fromisoformat(timestamp)
                        )
                        db.add(db_message)
                        db.commit()
                        print(f"File message saved: {message_id} from user_id {user_id} to recipient_id {recipient_id}")
                        message_data_response = {
                            "type": "file_message",
                            "message": {
                                "id": message_id,
                                "fileName": file_name,
                                "fileType": message_data["message"]["fileType"],
                                "fileUrl": f"http://localhost:8000/{file_path}",
                                "sender": {
                                    "id": user.id,
                                    "username": user.username,
                                    "first_name": user.first_name or user.username,
                                    "last_name": user.last_name or "",
                                    "avatar": user.avatar
                                },
                                "timestamp": timestamp,
                                "read": False
                            }
                        }
                        if recipient_id:
                            message_data_response["message"]["recipient"] = {
                                "id": recipient.id,
                                "username": recipient.username,
                                "first_name": recipient.first_name or recipient.username,
                                "last_name": recipient.last_name or "",
                                "avatar": recipient.avatar
                            }
                            await manager.send_personal_message(message_data_response, user_id)
                            if recipient.id in manager.active_connections:
                                await manager.send_personal_message(message_data_response, recipient.id)
                        else:
                            await manager.broadcast(message_data_response)
                        file_data = None
                    finally:
                        db.close()
                elif message_data["type"] == "read_receipt":
                    db = SessionLocal()
                    try:
                        message_id = message_data.get("messageId")
                        partner_id = message_data.get("userId")
                        if not message_id or not partner_id:
                            print(f"Invalid read receipt data for user_id {user_id}: messageId={message_id}, partner_id={partner_id}")
                            continue
                        message = db.query(ChatMessage).filter(
                            ChatMessage.id == message_id,
                            ChatMessage.sender_id == partner_id,
                            ChatMessage.recipient_id == user_id
                        ).first()
                        if message:
                            message.is_read = True
                            db.commit()
                            print(f"Read receipt processed for message_id {message_id} from user_id {user_id}")
                            if partner_id in manager.active_connections:
                                await manager.send_personal_message({
                                    "type": "read_receipt",
                                    "messageId": message_id,
                                    "userId": user_id
                                }, partner_id)
                    finally:
                        db.close()
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for user_id {user_id}")
        manager.disconnect(user_id)
    except Exception as e:
        print(f"WebSocket error for user_id {user_id}: {str(e)}")
        manager.disconnect(user_id)