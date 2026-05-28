ALTER TABLE "products"
ADD COLUMN "color" TEXT,
ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "stock_movements" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "stock_movements"
ADD CONSTRAINT "stock_movements_product_id_fkey"
FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DO $$
DECLARE
  bracelet_price INTEGER;
  bracelet_active BOOLEAN;
BEGIN
  SELECT price, is_active
    INTO bracelet_price, bracelet_active
  FROM "products"
  WHERE "name" = 'Браслет'
  ORDER BY id
  LIMIT 1;

  IF bracelet_price IS NOT NULL THEN
    INSERT INTO "products" ("code", "name", "color", "price", "quantity", "is_active", "updated_at")
    VALUES
      ('bracelet_turquoise', 'Браслет', 'Бирюзовый', bracelet_price, 0, bracelet_active, CURRENT_TIMESTAMP),
      ('bracelet_red', 'Браслет', 'Красный', bracelet_price, 0, bracelet_active, CURRENT_TIMESTAMP),
      ('bracelet_black', 'Браслет', 'Черный', bracelet_price, 0, bracelet_active, CURRENT_TIMESTAMP),
      ('bracelet_yellow', 'Браслет', 'Желтый', bracelet_price, 0, bracelet_active, CURRENT_TIMESTAMP),
      ('bracelet_blue', 'Браслет', 'Синий', bracelet_price, 0, bracelet_active, CURRENT_TIMESTAMP),
      ('bracelet_green', 'Браслет', 'Зеленый', bracelet_price, 0, bracelet_active, CURRENT_TIMESTAMP)
    ON CONFLICT ("code") DO NOTHING;

    UPDATE "products"
    SET "is_active" = false,
        "updated_at" = CURRENT_TIMESTAMP
    WHERE "name" = 'Браслет'
      AND "color" IS NULL
      AND "code" NOT IN (
        'bracelet_turquoise',
        'bracelet_red',
        'bracelet_black',
        'bracelet_yellow',
        'bracelet_blue',
        'bracelet_green'
      );
  END IF;
END $$;
