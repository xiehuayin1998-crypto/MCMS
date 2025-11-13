// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui';

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  item,
  type,
  onConfirm
}) {
  const getTitle = () => {
    if (type === 'room') {
      return `删除会议室：${item?.name}`;
    } else {
      return `删除预约：${item?.topic}`;
    }
  };
  const getDescription = () => {
    if (type === 'room') {
      return '删除后该会议室的所有预约记录也将被删除，此操作不可恢复。';
    } else {
      return '删除后该预约记录将永久删除，此操作不可恢复。';
    }
  };
  return <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          <AlertDialogDescription>
            {getDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            确认删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>;
}