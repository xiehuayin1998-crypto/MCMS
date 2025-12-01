
    interface UpdateUserData {
      [key: string]: any;
    }

    interface CloudFunctionEvent {
      targetUserId: string;
      updateData: UpdateUserData;
    }

    interface CloudFunctionResult {
      success: boolean;
      data?: any;
      error?: string;
      message?: string;
    }

    export declare function main(event: CloudFunctionEvent, context: any): Promise<CloudFunctionResult>;
  