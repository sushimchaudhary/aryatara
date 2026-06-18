"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Crown, Save, Loader2 } from "lucide-react";
import { ConfigProvider } from "antd";
import { Form, FormItem, FormMessage } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { CancelButton } from "@/components/ui/CancleButton";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { ChairmanMessageServices } from "@/services/chairmanmessageServices";
import CKEditorField from "@/components/CkEditorfield";

export function ChairmanMessageForm({
  initialData,
  onSuccess,
  onClose,
  isOpen,
}: any) {
  const { primaryColor } = useTheme();
  const isUpdate = !!initialData;
  const [loading, setLoading] = useState(false);

  const form = useForm({ defaultValues: { title: "", description: "" } });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          title: initialData.title || "",
          description: initialData.description || "",
        });
      } else {
        form.reset({ title: "", description: "" });
      }
    }
  }, [initialData, isOpen]);

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (isUpdate) {
        await ChairmanMessageServices.updateDetails(initialData.id, values);
        toast.success("Message updated!");
      } else {
        await ChairmanMessageServices.createDetails(values);
        toast.success("Message created!");
      }
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(ChairmanMessageServices.parseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-[101] flex items-center justify-center p-4 transition-all duration-300 ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="w-full max-w-2xl bg-white rounded shadow-md border border-gray-200 overflow-hidden   max-h-[92vh] flex flex-col">
          <ConfigProvider
            theme={{ token: { colorPrimary: primaryColor, borderRadius: 4 } }}
          >
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Crown size={15} style={{ color: primaryColor }} />
                {isUpdate ? "Edit Chairman's Message" : "New Chairman's Message"}
              </h2>
              <button
                onClick={handleClose}
                className="text-red-500 hover:rotate-90 transition-transform"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 scrollbar-hide">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="px-6 py-4 space-y-4"
                >
                  {/* Title */}
                  <Controller
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <ThemedInput
                          label="Title"
                          icon={<Crown size={12} />}
                          placeholder="Enter title"
                          {...field}
                        />
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  {/* Description — CKEditor */}
                  <Controller
                    control={form.control}
                    name="description"
                    render={({ field, fieldState }) => (
                      <CKEditorField
                        label="Message"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Chairman's message..."
                        height={280}
                        error={fieldState.error?.message}
                      />
                    )}
                  />

                  {/* Footer */}
                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 sticky bottom-0 bg-white pb-1">
                    <CancelButton onClick={handleClose} disabled={loading} />
                    <ThemedButton type="submit" size="sm" disabled={loading}>
                      <div className="flex items-center gap-2">
                        {loading ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Save size={12} />
                        )}
                        <span>{isUpdate ? "Update" : "Create"}</span>
                      </div>
                    </ThemedButton>
                  </div>
                </form>
              </Form>
            </div>
          </ConfigProvider>
        </div>
      </div>
    </>
  );
}