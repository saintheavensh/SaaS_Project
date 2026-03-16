import { Context } from 'hono';
import { DevicesService } from './devices.service.js';
import { CreateDeviceInput, UpdateDeviceInput } from './types.js';
import { AppEnv } from '../../core/types/app-env.js';
import { successResponse, errorResponse } from '../../core/utils/response.js';
import { CreateDeviceSchema, UpdateDeviceSchema, DeviceIdParamSchema } from './schemas/devices.schemas.js';

/**
 * Controller for Devices endpoints
 */
export class DevicesController {
  constructor(private readonly service: DevicesService) {}

  /**
   * List all devices
   */
  async listDevices(c: Context<AppEnv>) {
    try {
      const devices = await this.service.getDevices();
      return successResponse(c, devices, 'Devices retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to fetch devices', message);
    }
  }

  /**
   * Get device by ID
   */
  async getDevice(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      DeviceIdParamSchema.parse({ id });

      const device = await this.service.getDeviceById(id!);
      if (!device) {
        return errorResponse(c, 'Not Found', 'Device not found', 404);
      }
      return successResponse(c, device, 'Device retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to fetch device', message);
    }
  }

  /**
   * Create device
   */
  async createDevice(c: Context<AppEnv>) {
    try {
      const body = await c.req.json();
      const validated = CreateDeviceSchema.parse(body);
      
      const device = await this.service.createDevice(validated as CreateDeviceInput);
      return successResponse(c, device, 'Device created successfully', 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to create device', message, 400);
    }
  }

  /**
   * Update device
   */
  async updateDevice(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      DeviceIdParamSchema.parse({ id });
      
      const body = await c.req.json();
      const validated = UpdateDeviceSchema.parse(body);
      
      const result = await this.service.updateDevice(id!, validated as UpdateDeviceInput);
      if (!result) {
        return errorResponse(c, 'Not Found', 'Device not found', 404);
      }
      return successResponse(c, result, 'Device updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to update device', message, 400);
    }
  }

  /**
   * Delete device
   */
  async deleteDevice(c: Context<AppEnv>) {
    try {
      const id = c.req.param('id');
      DeviceIdParamSchema.parse({ id });

      const success = await this.service.deleteDevice(id!);
      if (!success) {
        return errorResponse(c, 'Not Found', 'Device not found or delete failed', 404);
      }
      return successResponse(c, null, 'Device deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return errorResponse(c, 'Failed to delete device', message);
    }
  }
}
