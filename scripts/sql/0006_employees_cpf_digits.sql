-- employees: guarda o CPF só com dígitos (o cadastro público já fazia isso; o cadastro
-- feito pelo gestor guardava com pontos e traço). Rode UMA vez.
-- Se falhar por violar employees_cpf_active_uniq, há dois funcionários com o mesmo CPF
-- escrito de formas diferentes: resolva-os antes de repetir.
UPDATE employees
SET cpf = regexp_replace(cpf, '\D', '', 'g')
WHERE cpf ~ '\D';
