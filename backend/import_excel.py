import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://postgres:mypassword@localhost/royal_jeans"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def import_excel_to_db():
    try:
        # خوندن اکسل و تبدیل همه ستون‌ها به متن
        df = pd.read_excel("database_product_code.xlsx", dtype=str)
        # پر کردن مقادیر خالی با ""
        df = df.fillna("")
        db = SessionLocal()
        # پاک کردن جدول قبلی
        db.execute(text("TRUNCATE TABLE product_codes RESTART IDENTITY"))
        for _, row in df.iterrows():
            db.execute(text("""
                INSERT INTO product_codes (
                    category, category_code, material, material_code, model, model_code,
                    style1, style1_code, style2, style2_code, style3, style3_code,
                    style4, style4_code, weight, weight_code, length, length_code,
                    color, color_code, fabric, fabric_code, size, size_code
                ) VALUES (
                    :category, :category_code, :material, :material_code, :model, :model_code,
                    :style1, :style1_code, :style2, :style2_code, :style3, :style3_code,
                    :style4, :style4_code, :weight, :weight_code, :length, :length_code,
                    :color, :color_code, :fabric, :fabric_code, :size, :size_code
                )
            """), {
                "category": row.get("دسته", ""),
                "category_code": row.get("کد دسته", "").zfill(2),  # اطمینان از 2 رقم
                "material": row.get("جنس", ""),
                "material_code": row.get("کد جنس", "").zfill(2),
                "model": row.get("مدل", ""),
                "model_code": row.get("کد مدل", "").zfill(3),
                "style1": row.get("استایل 1", ""),
                "style1_code": row.get("کد استایل 1", "").zfill(2),
                "style2": row.get("استایل 2", ""),
                "style2_code": row.get("کد استایل 2", "").zfill(2),
                "style3": row.get("استایل 3", ""),
                "style3_code": row.get("کد استایل 3", "").zfill(2),
                "style4": row.get("استایل 4", ""),
                "style4_code": row.get("کد استایل 4", "").zfill(2),
                "weight": row.get("گرم", ""),
                "weight_code": row.get("کد گرم", "").zfill(1),
                "length": row.get("قد", ""),
                "length_code": row.get("کد قد", "").zfill(2),
                "color": row.get("رنگ", ""),
                "color_code": row.get("کد رنگ", "").zfill(3),
                "fabric": row.get("پارچه", ""),
                "fabric_code": row.get("کد پارچه", "").zfill(2),
                "size": row.get("سایز", ""),
                "size_code": row.get("کد سایز", "").zfill(2)
            })
        db.commit()
        print("داده‌ها با موفقیت وارد شدند")
    except Exception as e:
        print(f"خطا: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import_excel_to_db()