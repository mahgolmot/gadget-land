-- Gadget Land compatibility migration.
-- Safe for both a fresh schema and upgrades from the reference store.
ALTER TABLE products
  MODIFY brand VARCHAR(100) NOT NULL DEFAULT '',
  MODIFY category VARCHAR(150) NOT NULL DEFAULT 'uncategorized';

INSERT IGNORE INTO catalog_categories(name,slug,sort_order) VALUES
('قاب و کاور','case',0),
('هدفون و صوتی','audio',1),
('شارژر و انرژی','power',2),
('لوازم جانبی','accessory',3);

INSERT IGNORE INTO product_catalog_categories(product_id,category_id,is_primary)
SELECT p.id,c.id,1
FROM products p
JOIN catalog_categories c ON c.slug=p.category;

INSERT INTO settings(`key`,`value`) VALUES('store_name','گجت‌لند')
ON DUPLICATE KEY UPDATE `value`=IF(`value` IN ('Noura','gadgetland','بی‌لومیر','نورا'),VALUES(`value`),`value`);
