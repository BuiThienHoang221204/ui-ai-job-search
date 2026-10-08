"use client";

import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/form";
import { SelectMenu } from "@/components/ui/select-menu";
import { Modal } from "@/components/ui/modal";
import {
  EMPLOYMENT_OPTIONS,
  RECORDS,
  asItems,
  fromFormValues,
  toFormValues,
  type Item,
  type RecordType,
} from "./profile-config";
import { useProfile, useProfileUi, useSaveProfile } from "./use-profile";

const splitList = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const ignore = () => undefined;

/** Hàng nút cuối modal: xoá bên trái (nếu có), huỷ và lưu bên phải. */
function Footer({
  onCancel,
  onDelete,
  saving = false,
}: {
  onCancel: () => void;
  onDelete?: () => void;
  saving?: boolean;
}) {
  return (
    <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4">
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="cursor-pointer text-sm font-semibold text-rose-600 hover:text-rose-700"
        >
          Xoá mục này
        </button>
      )}
      <div className="ml-auto flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Huỷ
        </Button>
        <Button type="submit" loading={saving}>
          Lưu
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

interface BasicValues {
  headline: string;
  employmentStatus: string;
  phone: string;
  location: string;
  country: string;
  languages: string;
  summary: string;
}

/** Form thông tin cơ bản: chức danh, liên hệ, nơi ở, ngôn ngữ, giới thiệu. */
function BasicForm() {
  const { data: profile } = useProfile();
  const close = useProfileUi((state) => state.close);
  const { save, saving } = useSaveProfile();
  const { register, handleSubmit, control } = useForm<BasicValues>({
    defaultValues: {
      headline: profile?.headline ?? "",
      employmentStatus: profile?.employmentStatus ?? "",
      phone: profile?.phone ?? "",
      location: profile?.location ?? "",
      country: profile?.country ?? "",
      languages: profile?.languages.join(", ") ?? "",
      summary: profile?.summary ?? "",
    },
  });
  const status = profile?.employmentStatus;
  const statusOptions =
    status && !EMPLOYMENT_OPTIONS.includes(status)
      ? [status, ...EMPLOYMENT_OPTIONS]
      : EMPLOYMENT_OPTIONS;

  const onSubmit = handleSubmit((values) =>
    save({ ...values, languages: splitList(values.languages) }).then(
      close,
      ignore,
    ),
  );

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <Field label="Chức danh" htmlFor="b-headline">
        <Input
          id="b-headline"
          placeholder="Backend Developer"
          {...register("headline")}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tình trạng" htmlFor="b-status">
          <Controller
            control={control}
            name="employmentStatus"
            render={({ field }) => (
              <SelectMenu
                id="b-status"
                variant="field"
                label="Chưa chọn"
                value={field.value}
                options={statusOptions.map((option) => ({
                  value: option,
                  label: option,
                }))}
                onChange={field.onChange}
              />
            )}
          />
        </Field>
        <Field label="Điện thoại" htmlFor="b-phone">
          <Input id="b-phone" placeholder="0901234567" {...register("phone")} />
        </Field>
        <Field label="Nơi ở hiện tại" htmlFor="b-location">
          <Input
            id="b-location"
            placeholder="Hồ Chí Minh"
            {...register("location")}
          />
        </Field>
        <Field label="Quốc gia" htmlFor="b-country">
          <Input
            id="b-country"
            placeholder="Việt Nam"
            {...register("country")}
          />
        </Field>
      </div>
      <Field label="Ngôn ngữ (ngăn cách bằng dấu phẩy)" htmlFor="b-languages">
        <Input
          id="b-languages"
          placeholder="Tiếng Việt, English"
          {...register("languages")}
        />
      </Field>
      <Field label="Giới thiệu ngắn" htmlFor="b-summary">
        <Textarea
          id="b-summary"
          rows={5}
          placeholder="2–3 câu về kinh nghiệm và thế mạnh"
          {...register("summary")}
        />
      </Field>
      <Footer onCancel={close} saving={saving} />
    </form>
  );
}

/** Form một mục (kinh nghiệm, dự án, học vấn, chứng chỉ); ô nhập lấy từ `RECORDS`, nơi gọi tự lưu. */
export function RecordForm({
  type,
  item,
  onSubmit,
  onCancel,
  onDelete,
  saving,
}: {
  type: RecordType;
  item: Item;
  onSubmit: (item: Item) => void;
  onCancel: () => void;
  onDelete?: () => void;
  saving?: boolean;
}) {
  const config = RECORDS[type];
  const [first] = config.fields;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, string>>({
    defaultValues: toFormValues(type, item),
  });

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit(fromFormValues(type, values, item)),
      )}
      className="grid gap-4"
    >
      {config.fields.map((field) => {
        const id = `r-${field.name}`;
        const props = register(
          field.name,
          field === first
            ? { required: `Cần nhập ${field.label.toLowerCase()}` }
            : {},
        );
        return (
          <Field key={field.name} label={field.label} htmlFor={id}>
            {field.kind === "lines" || field.kind === "area" ? (
              <Textarea
                id={id}
                rows={field.kind === "lines" ? 5 : 4}
                placeholder={field.placeholder}
                {...props}
              />
            ) : (
              <Input id={id} placeholder={field.placeholder} {...props} />
            )}
            {field.kind === "lines" && (
              <p className="mt-1 text-xs text-slate-500">Mỗi dòng một ý.</p>
            )}
            {field.kind === "tags" && (
              <p className="mt-1 text-xs text-slate-500">
                Ngăn cách bằng dấu phẩy.
              </p>
            )}
            {errors[field.name] && (
              <p className="mt-1 text-xs text-rose-600">
                {errors[field.name]?.message}
              </p>
            )}
          </Field>
        );
      })}
      <Footer onCancel={onCancel} onDelete={onDelete} saving={saving} />
    </form>
  );
}

/** Sửa một mục ngay trong hồ sơ: thêm/sửa/xoá rồi lưu cả danh sách. */
function ProfileRecordForm({
  type,
  index,
}: {
  type: RecordType;
  index: number | null;
}) {
  const { data: profile } = useProfile();
  const close = useProfileUi((state) => state.close);
  const { save, saving } = useSaveProfile();
  const items = asItems(profile?.[type]);
  const saveItems = (next: Item[]) =>
    void save({ [type]: next }).then(close, ignore);

  return (
    <RecordForm
      type={type}
      item={index === null ? {} : (items[index] ?? {})}
      saving={saving}
      onCancel={close}
      onSubmit={(item) =>
        saveItems(
          index === null
            ? [item, ...items]
            : items.map((entry, at) => (at === index ? item : entry)),
        )
      }
      onDelete={
        index === null
          ? undefined
          : () => saveItems(items.filter((_, at) => at !== index))
      }
    />
  );
}

/** Modal sửa hồ sơ; mục đang sửa lấy từ store nên khối nào cũng mở được. */
export function EditModal() {
  const editing = useProfileUi((state) => state.editing);
  const close = useProfileUi((state) => state.close);
  if (!editing) return null;

  const title =
    editing.kind === "basic"
      ? "Sửa thông tin cơ bản"
      : `${editing.index === null ? "Thêm" : "Sửa"} ${RECORDS[editing.type].title.toLowerCase()}`;

  return (
    <Modal
      open
      onClose={close}
      title={title}
      className="max-h-[90vh] max-w-xl overflow-y-auto"
    >
      {editing.kind === "basic" ? (
        <BasicForm />
      ) : (
        <ProfileRecordForm type={editing.type} index={editing.index} />
      )}
    </Modal>
  );
}
