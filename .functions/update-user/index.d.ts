
    interface UpdateUserRequest {
      userId: string;
      updateData: Record<string, any>;
    }

    interface UpdateUserSuccessResponse {
      success: true;
      data: any;
      message: string;
    }

    interface UpdateUserErrorResponse {
      success: false;
      errorCode: string;
      errorMessage: string;
    }

    type UpdateUserResponse = UpdateUserSuccessResponse | UpdateUserErrorResponse;

    interface CloudFunctionEvent {
      action?: string;
      userId: string;
      updateData: Record<string, any>;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<UpdateUserResponse>;
  