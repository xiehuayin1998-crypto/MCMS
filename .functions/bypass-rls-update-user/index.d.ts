
    interface UpdateUserData {
      targetUserId: string;
      updateData: Record<string, any>;
    }

    interface CloudFunctionResult {
      success: boolean;
      message: string;
      updatedUser?: Record<string, any>;
    }

    export declare function main(event: UpdateUserData, context: any): Promise<CloudFunctionResult>;
  