
    interface AdminUpdateUserRequest {
      userId: string;
      updateData: Record<string, any>;
    }

    interface AdminUpdateUserSuccessResponse {
      success: true;
      data: {
        updated: number;
        user: any;
      };
      message: string;
    }

    interface AdminUpdateUserErrorResponse {
      success: false;
      errorCode: string;
      errorMessage: string;
    }

    type AdminUpdateUserResponse = AdminUpdateUserSuccessResponse | AdminUpdateUserErrorResponse;

    interface CloudFunctionEvent {
      action?: string;
      userId: string;
      updateData: Record<string, any>;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<AdminUpdateUserResponse>;
  