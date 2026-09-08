'use client';

import { useState } from 'react';
import { api, type RouterOutputs } from '@/trpc/react';
import { EmployeeCard } from './_components/employee-card';
import { EmployeeTable } from './_components/employee-table';
import { EmployeeToolbar } from './_components/employee-toolbar';
import { EmployeeFormDialog, type EmployeeFormValues } from './_components/employee-form-dialog';

type Employee = RouterOutputs['employees']['getAll'][number];

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const utils = api.useUtils();
  const { data: employees = [], isLoading } = api.employees.getAll.useQuery();
  const { data: sectors = [] } = api.sectors.getAll.useQuery();

  const createMutation = api.employees.create.useMutation({
    onSuccess: () => {
      void utils.employees.getAll.invalidate();
      setDialogOpen(false);
    },
  });

  const updateMutation = api.employees.update.useMutation({
    onSuccess: () => {
      void utils.employees.getAll.invalidate();
      setDialogOpen(false);
    },
  });

  const filtered = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.cpf.includes(search)
  );

  const handleOpenCreate = () => {
    setSelectedEmployee(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  const handleSubmitForm = async (data: EmployeeFormValues) => {
    if (selectedEmployee) {
      await updateMutation.mutateAsync({
        id: selectedEmployee.id,
        ...data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Funcionários</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie todos os colaboradores, uniformes e dados pessoais.
        </p>
      </div>

      <EmployeeToolbar
        search={search}
        onSearchChange={setSearch}
        onNewClick={handleOpenCreate}
      />

      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Carregando colaboradores...
        </div>
      ) : (
        <>
          <div className="block sm:hidden">
            {filtered.map((emp) => (
              <div key={emp.id} onClick={() => handleOpenEdit(emp)} className="cursor-pointer">
                <EmployeeCard employee={emp} />
              </div>
            ))}
          </div>

          <div className="hidden sm:block">
            <EmployeeTable employees={filtered} onSelectEmployee={handleOpenEdit} />
          </div>
        </>
      )}

      <EmployeeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employeeToEdit={selectedEmployee}
        sectorsList={sectors}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
}