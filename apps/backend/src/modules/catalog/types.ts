/**
 * Type representing a device in the catalog output
 */
export type CatalogDevice = {
  id: string;
  brand: string;
  model: string;
  series?: string | null;
};

/**
 * Type representing a product with its compatible devices
 */
export type CatalogProduct = {
  id: string;
  name: string;
  compatibleDevices: CatalogDevice[];
};

/**
 * Type representing the final catalog display output
 */
export type CatalogDisplay = {
  productId: string;
  title: string;
};

/**
 * Type representing compatible spareparts for a specific device
 */
export type DeviceSparepartResult = {
  deviceId: string;
  deviceBrand: string;
  deviceModel: string;
  products: {
    id: string;
    name: string;
  }[];
};
