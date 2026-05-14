"use client";
import React, { useState, ChangeEvent } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  IApprovedUserEP,
  IGetUserTypesEP,
} from "@webEndPoints/handlers/userWEB/IuserWEB";
import {
  ApprovedUserEP,
  GetUserTypesEP,
} from "@webEndPoints/handlers/userWEB/userWEB";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import CustomDialogTitle from "@lib/CustomDialogTitle";
import ButtonRFH from "@lib/ButtonRFH";
import { GetDataByFlagEP } from "@webEndPoints/handlers/commonWEB/commonWEB";
import { IGetDataByFlagEP } from "@webEndPoints/handlers/commonWEB/IcommonWEB";
import useSession from "@app/auth/session/useSession";

interface UserApprovalPopupProps {
  onClose: () => void;
  refreshUser: () => void;
  user_id: number;
}

const UserApprovalPoup = ({
  onClose,
  user_id,
  refreshUser,
}: UserApprovalPopupProps) => {
  const { session } = useSession();
  const [remarks, setRemarks] = useState<string>("");
  const [userTypeId, setUserTypeId] = useState<number>(0);
  const [webPageId, setWebPageId] = useState<number>(0);
  const [compProps, setCompProps] = React.useState({
    isLoading: false,
  });

  const handleApprove = () => {
    onApprove(remarks, userTypeId);
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
  };

  const resetForm = () => {
    setRemarks("");
    setUserTypeId(0);
    onClose();
  };

  const onApprove = async (remarks: string, userTypeId: number) => {
    try {
      if (userTypeId < 1) {
        toast.error("Plese select user type.");
        return;
      } else if (webPageId < 1) {
        toast.error("Plese select default web page.");
        return;
      } else if (remarks?.length < 1) {
        toast.error("Plese approval remarks.");
        return;
      }
      setCompProps((prev) => ({ ...prev, isLoading: true }));
      const req: IApprovedUserEP = {
        user_id: user_id,
        approval_desc: remarks,
        user_type_id: userTypeId,
        web_page_id: webPageId,
      };
      const res = await ApprovedUserEP(req);
      const action = res?.action;
      toast[action as "success"](res?.title);
      refreshUser();
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCompProps((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleRoleChange = (e: SelectChangeEvent<number>) => {
    const selectedRole = e.target.value;
    setUserTypeId(selectedRole);
  };

  const handleWebPageChange = (e: SelectChangeEvent<number>) => {
    const id = e.target.value;
    setWebPageId(id);
  };

  const handleRemarksChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setRemarks(text);
  };

  const { data: userTypeLis } = useQuery<IGetUserTypesEP[]>({
    queryKey: ["GGetUserTypesEP", "USERADMIN", session?.user_type_code],
    queryFn: async () => {
      const res = await GetUserTypesEP();
      const data = res?.data ?? [];
      if (session?.user_type_code !== "SUPER_ADMIN") {
        return data?.filter(
          (x: IGetUserTypesEP) => x?.user_type_code !== "SUPER_ADMIN"
        );
      }
      return data;
    },
  });

  const { data: webPageList } = useQuery<IGetDataByFlagEP[]>({
    queryKey: ["WEB_PAGES", userTypeId],
    enabled: Number(userTypeId ?? 0) > 0,
    queryFn: async () => {
      const res = await GetDataByFlagEP("WEB_PAGES", userTypeId);
      const data: IGetDataByFlagEP[] = res?.data ?? [];
      if (data && data?.length == 1) {
        const def = data[0];
        if (def && Number(def?.id ?? 0) > 0) {
          setWebPageId(def?.id);
        }
      }
      return data;
    },
  });

  return (
    <Dialog open onClose={handleCancel} fullWidth maxWidth="sm">
      <CustomDialogTitle title={"User Approval"} />
      <DialogContent sx={{ paddingTop: "20px" }}>
        <Box sx={{ minHeight: "120px", paddingTop: "20px" }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="userTypeId-label">User Type</InputLabel>
            <Select
              labelId="userTypeId-label"
              value={userTypeId}
              label="User Type"
              onChange={handleRoleChange}
            >
              {(userTypeLis ?? []).map((item: IGetUserTypesEP) => (
                <MenuItem key={item?.user_type_id} value={item?.user_type_id}>
                  {item.user_type_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="userTypeId-label">Default Page Name</InputLabel>
            <Select
              value={webPageId}
              label="Default Page Name"
              onChange={handleWebPageChange}
            >
              {(webPageList ?? []).map((item: IGetDataByFlagEP) => (
                <MenuItem key={item?.id} value={item?.id}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Approval Remarks"
            placeholder="Type your remark here..."
            fullWidth
            multiline
            minRows={5}
            variant="outlined"
            value={remarks}
            onChange={handleRemarksChange}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: "6px",
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <ButtonRFH color="error" onClick={onClose}>
          Cancel
        </ButtonRFH>
        <ButtonRFH
          onClick={handleApprove}
          variant="contained"
          color={"success"}
          disabled={!(userTypeId > 0) || !(webPageId > 0) || !(remarks !== "")}
          loading={compProps?.isLoading}
        >
          APPROVED
        </ButtonRFH>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(UserApprovalPoup);
