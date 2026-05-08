/** Columns needed for listing cards — avoids hauling large `specifications` / unused blobs over the wire. */
export const SHOP_PRODUCT_COLUMNS =
  'id,slug,title,description,price,compare_at_price,images,categories,rating,review_count,inventory,variants,created_at' as const;
