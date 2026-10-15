import { useContext } from "react";
import { SessionContext } from "@/providers/session-provider";

/** Đọc phiên đăng nhập hiện tại từ `SessionProvider`. */
export const useSession = () => useContext(SessionContext);
