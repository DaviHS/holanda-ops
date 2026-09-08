"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { insertEmployeeSchema } from "@/server/db/schema";
import type { Employee } from "@/server/db/schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Usa z.input para lidar corretamente com campos que possuem .default() no schema Zod
export type EmployeeFormValues = z.input<typeof insertEmployeeSchema>;

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeToEdit?: (Employee & { sectorIds?: string[] }) | null;
  sectorsList?: { id: string; name: string }[];
  onSubmit: (data: EmployeeFormValues) => Promise<void>;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employeeToEdit,
  sectorsList = [],
  onSubmit,
}: EmployeeFormDialogProps) {
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: {
      name: "",
      cpf: "",
      rg: "",
      pixKey: "",
      address: "",
      userId: null,
      sectorIds: [],
      status: "active",
      shift: "day",
      entryTime: "08:00",
      exitTime: "17:00",
      shirtSize: "M",
      pantsSize: "",
      shoeSize: null,
      uniform: {
        shirt: false,
        pants: false,
        shoes: false,
        jacket: false,
      },
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (employeeToEdit) {
      reset({
        name: employeeToEdit.name ?? "",
        cpf: employeeToEdit.cpf ?? "",
        rg: employeeToEdit.rg ?? "",
        pixKey: employeeToEdit.pixKey ?? "",
        address: employeeToEdit.address ?? "",
        userId: employeeToEdit.userId ?? null,
        sectorIds: employeeToEdit.sectorIds ?? [],
        status: employeeToEdit.status ?? "active",
        shift: employeeToEdit.shift ?? "day",
        entryTime: employeeToEdit.entryTime ?? "08:00",
        exitTime: employeeToEdit.exitTime ?? "17:00",
        shirtSize: employeeToEdit.shirtSize ?? "M",
        pantsSize: employeeToEdit.pantsSize ?? "",
        shoeSize: employeeToEdit.shoeSize ?? null,
        uniform: employeeToEdit.uniform ?? {
          shirt: false,
          pants: false,
          shoes: false,
          jacket: false,
        },
      });
    } else {
      reset({
        name: "",
        cpf: "",
        rg: "",
        pixKey: "",
        address: "",
        userId: null,
        sectorIds: [],
        status: "active",
        shift: "day",
        entryTime: "08:00",
        exitTime: "17:00",
        shirtSize: "M",
        pantsSize: "",
        shoeSize: null,
        uniform: {
          shirt: false,
          pants: false,
          shoes: false,
          jacket: false,
        },
      });
    }
  }, [employeeToEdit, reset, open]);

  const handleFormSubmit = async (data: EmployeeFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  const selectedSectorIds = watch("sectorIds") ?? [];
  const statusValue = watch("status") ?? "active";
  const shiftValue = watch("shift") ?? "day";
  const shirtSizeValue = watch("shirtSize") ?? "M";
  const uniformState = watch("uniform") ?? {
    shirt: false,
    pants: false,
    shoes: false,
    jacket: false,
  };

  const handleSectorToggle = (sectorId: string) => {
    const current = [...selectedSectorIds];
    const index = current.indexOf(sectorId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(sectorId);
    }
    setValue("sectorIds", current, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {employeeToEdit ? "Editar Funcionário" : "Novo Funcionário"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          {/* Nome & CPF */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input id="name" {...register("name")} placeholder="João Silva" />
              {errors.name && (
                <span className="text-xs text-red-500">{errors.name.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input id="cpf" {...register("cpf")} placeholder="000.000.000-00" />
              {errors.cpf && (
                <span className="text-xs text-red-500">{errors.cpf.message}</span>
              )}
            </div>
          </div>

          {/* RG & Chave Pix */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input id="rg" {...register("rg")} placeholder="00.000.000-0" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input id="pixKey" {...register("pixKey")} placeholder="CPF, e-mail ou celular" />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="address">Endereço completo</Label>
            <Input id="address" {...register("address")} placeholder="Rua, número, bairro..." />
          </div>

          {/* Setores (Seleção Múltipla via Checkbox) */}
          <div className="space-y-2">
            <Label>Setores *</Label>
            <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
              {sectorsList.map((sec) => {
                const isChecked = selectedSectorIds.includes(sec.id);
                return (
                  <label key={sec.id} className="flex items-center space-x-2 text-sm">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleSectorToggle(sec.id)}
                    />
                    <span>{sec.name}</span>
                  </label>
                );
              })}
            </div>
            {errors.sectorIds && (
              <span className="text-xs text-red-500">{errors.sectorIds.message}</span>
            )}
          </div>

          {/* Status, Turno & Tamanho da Camisa */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={statusValue}
                onValueChange={(val) => {
                  if (val) setValue("status", val);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Turno</Label>
              <Select
                value={shiftValue}
                onValueChange={(val) => {
                  if (val) setValue("shift", val);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Diurno</SelectItem>
                  <SelectItem value="night">Noturno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tamanho Camisa</Label>
              <Select
                value={shirtSizeValue}
                onValueChange={(val) => {
                  if (val) setValue("shirtSize", val);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["XS", "S", "M", "L", "XL", "XXL"] as const).map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Horários */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="entryTime">Entrada</Label>
              <Input id="entryTime" type="time" {...register("entryTime")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exitTime">Saída</Label>
              <Input id="exitTime" type="time" {...register("exitTime")} />
            </div>
          </div>

          {/* Calça e Sapato */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pantsSize">Tamanho Calça</Label>
              <Input id="pantsSize" {...register("pantsSize")} placeholder="Ex: 40, 42, G" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shoeSize">Número Calçado</Label>
              <Input
                id="shoeSize"
                type="number"
                placeholder="Ex: 41"
                {...register("shoeSize", {
                  setValueAs: (v) => (v === "" || isNaN(v) ? null : Number(v)),
                })}
              />
            </div>
          </div>

          {/* Uniforme Entregue */}
          <div className="space-y-2">
            <Label>Uniforme Entregue</Label>
            <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
              <label className="flex items-center space-x-2 text-sm">
                <Checkbox
                  checked={uniformState.shirt}
                  onCheckedChange={(checked) =>
                    setValue("uniform.shirt", Boolean(checked))
                  }
                />
                <span>Camisa</span>
              </label>

              <label className="flex items-center space-x-2 text-sm">
                <Checkbox
                  checked={uniformState.pants}
                  onCheckedChange={(checked) =>
                    setValue("uniform.pants", Boolean(checked))
                  }
                />
                <span>Calça</span>
              </label>

              <label className="flex items-center space-x-2 text-sm">
                <Checkbox
                  checked={uniformState.shoes}
                  onCheckedChange={(checked) =>
                    setValue("uniform.shoes", Boolean(checked))
                  }
                />
                <span>Sapatos</span>
              </label>

              <label className="flex items-center space-x-2 text-sm">
                <Checkbox
                  checked={Boolean(uniformState.jacket)}
                  onCheckedChange={(checked) =>
                    setValue("uniform.jacket", Boolean(checked))
                  }
                />
                <span>Jaqueta</span>
              </label>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}