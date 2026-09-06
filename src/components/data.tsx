export type ModuleKey = 'dashboard' | 'setores' | 'funcionarios' | 'cargos' | 'escalas' | 'frequencia' | 'atestados' | 'uniformes' | 'estoque' | 'contratos' | 'ocorrencias' | 'relatorios' | 'usuarios' | 'configuracoes'

export const sectors = [
  { name: 'Grajaú', type: 'Armazém Solidário', address: 'Av. Dona Belmira Marin, 482', manager: 'Carla Mendes', people: 12, schedule: '6x1', status: 'Em operação', contract: 'Ativo' },
  { name: 'Cidade Tiradentes', type: 'Armazém Solidário', address: 'R. dos Têxteis, 118', manager: 'Rafael Souza', people: 10, schedule: '5x2', status: 'Em operação', contract: 'Ativo' },
  { name: 'São Miguel', type: 'Unidade', address: 'R. Serra Branca, 90', manager: 'Juliana Alves', people: 8, schedule: '6x1', status: 'Em operação', contract: 'Ativo' },
  { name: "M'Boi Mirim", type: 'Unidade', address: 'Estr. do M’Boi Mirim, 3.200', manager: 'Marcos Lima', people: 7, schedule: '12x36', status: 'Atenção', contract: 'Próximo do vencimento' },
  { name: 'Condomínio Alpha', type: 'Condomínio', address: 'Al. dos Ipês, 700', manager: 'Paulo Nunes', people: 5, schedule: '12x36', status: 'Em operação', contract: 'Ativo' },
  { name: 'Obra Central', type: 'Obra', address: 'R. Flor de Maio, 41', manager: 'Denise Rocha', people: 4, schedule: '5x2', status: 'Em operação', contract: 'Ativo' },
]

export const employees = [
  ['João da Silva','Auxiliar de Limpeza','Grajaú','Manhã','6x1','07:00','17:00','Ativo'], ['Maria Oliveira','Supervisora','Grajaú','Manhã','5x2','08:00','18:00','Ativo'], ['Carlos Santos','Controle de Acesso','Cidade Tiradentes','Noturno','12x36','19:00','07:00','Ativo'], ['Ana Paula Costa','Serviços Gerais','São Miguel','Manhã','6x1','07:00','17:00','Ativo'], ['Pedro Henrique','Auxiliar de Limpeza','M\'Boi Mirim','Tarde','6x1','13:00','23:00','Ativo'], ['Luciana Martins','Auxiliar de Limpeza','Grajaú','Manhã','6x1','07:00','17:00','Ativo'], ['Rogério Alves','Porteiro','Condomínio Alpha','Noturno','12x36','19:00','07:00','Ativo'], ['Beatriz Lima','Auxiliar de Serviços Gerais','Obra Central','Manhã','5x2','08:00','18:00','Férias'], ['Fábio Mendes','Supervisor','São Miguel','Manhã','5x2','08:00','18:00','Ativo'], ['Camila Souza','Controle de Acesso','Cidade Tiradentes','Tarde','6x1','13:00','23:00','Ativo'], ['Marcos Vinícius','Zelador','Condomínio Alpha','Manhã','6x1','07:00','17:00','Ativo'], ['Juliana Reis','Auxiliar de Limpeza','Grajaú','Tarde','6x1','13:00','23:00','Ativo'], ['Eduardo Gomes','Porteiro','M\'Boi Mirim','Noturno','12x36','19:00','07:00','Ativo'], ['Patrícia Ramos','Serviços Gerais','Obra Central','Manhã','5x2','08:00','18:00','Ativo'], ['Diego Ferreira','Auxiliar de Limpeza','São Miguel','Tarde','6x1','13:00','23:00','Ativo'], ['Renata Castro','Coordenadora','Grajaú','Manhã','5x2','08:00','18:00','Ativo'], ['André Luiz','Auxiliar de Limpeza','Cidade Tiradentes','Manhã','6x1','07:00','17:00','Ativo'], ['Sônia Moura','Controle de Acesso','Condomínio Alpha','Noturno','12x36','19:00','07:00','Ativo'], ['Gustavo Dias','Serviços Gerais','M\'Boi Mirim','Manhã','6x1','07:00','17:00','Ativo'], ['Nathalia Freitas','Auxiliar de Limpeza','São Miguel','Manhã','6x1','07:00','17:00','Ativo'], ['Wesley Araújo','Porteiro','Condomínio Alpha','Tarde','12x36','13:00','23:00','Ativo'], ['Isabela Neri','Auxiliar de Limpeza','Grajaú','Tarde','6x1','13:00','23:00','Ativo'], ['Thiago Reis','Supervisor','M\'Boi Mirim','Manhã','5x2','08:00','18:00','Ativo'], ['Michele Dias','Serviços Gerais','Obra Central','Tarde','5x2','13:00','23:00','Desligado'], ['Samuel Torres','Auxiliar de Serviços Gerais','Cidade Tiradentes','Manhã','6x1','07:00','17:00','Ativo'],
].map(([name,role,sector,shift,scale,inTime,outTime,status]) => ({name,role,sector,shift,scale,inTime,outTime,status}))

export const alerts = [
  { title: 'João possui uniforme pendente.', detail: 'Uniformes · Grajaú', kind: 'warning' },
  { title: 'Estoque de desinfetante abaixo do mínimo.', detail: 'Estoque · Grajaú', kind: 'warning' },
  { title: 'Atestado de Maria termina amanhã.', detail: 'Atestados · Grajaú', kind: 'info' },
  { title: 'Contrato do setor Grajaú vence em 28 dias.', detail: 'Contratos', kind: 'warning' },
]

export const inventory = [
  ['Água sanitária','Limpeza','Litro','24','10','50','Normal'], ['Desinfetante','Limpeza','Galão','6','12','30','Abaixo do mínimo'], ['Detergente','Limpeza','Unidade','32','15','50','Normal'], ['Vassoura','Equipamentos','Unidade','8','5','20','Normal'], ['Rodo','Equipamentos','Unidade','3','5','15','Abaixo do mínimo'], ['Sacos de lixo','Descartáveis','Pacote','18','10','40','Normal'], ['Papel higiênico','Higiene','Fardo','9','8','24','Normal'],
].map(([name,category,unit,current,min,max,status]) => ({name,category,unit,current,min,max,status}))

export const contracts = [
  ['Contrato Grajaú','Prefeitura Regional Sul','Grajaú','01/02/2026','28/09/2026','Ativo'], ['Operação Cidade Tiradentes','Instituto Cidadania','Cidade Tiradentes','12/01/2026','18/12/2026','Ativo'], ['Serviços Alpha','Condomínio Alpha','Condomínio Alpha','01/03/2026','15/09/2026','Próximo do vencimento'], ['Manutenção M’Boi','Construtora Central','M\'Boi Mirim','10/04/2026','20/08/2026','Vencido'], ['Gestão São Miguel','Rede Solidária','São Miguel','02/01/2026','30/12/2026','Ativo'], ['Apoio Obra Central','Central Engenharia','Obra Central','15/05/2026','15/11/2026','Ativo'],
].map(([name,client,sector,start,end,status]) => ({name,client,sector,start,end,status}))

export const frequencies = employees.slice(0, 8).map((e, i) => ({...e, date: '24/08/2026', arrival: i === 2 ? '07:18' : e.inTime, departure: '—', attendance: i === 4 ? 'Falta' : i === 6 ? 'Atraso' : 'Presente'}))

export const occurrences = [
  {date:'24/08/2026', sector:'Grajaú', employee:'João da Silva', type:'Falta', description:'Ausência sem registro de justificativa.', owner:'Carla Mendes'},
  {date:'23/08/2026', sector:'São Miguel', employee:'Carlos Santos', type:'Problema operacional', description:'Atraso na entrega de materiais.', owner:'Fábio Mendes'},
  {date:'22/08/2026', sector:'Condomínio Alpha', employee:'Rogério Alves', type:'Elogio', description:'Reconhecimento do cliente pelo atendimento.', owner:'Paulo Nunes'},
]

export const reports = ['Funcionários por setor','Funcionários por cargo','Escalas','Frequência','Faltas','Atestados','Uniformes','Estoque','Movimentações','Contratos','Ocorrências']

export const navGroups = [
  {label:'PRINCIPAL', items:[['dashboard','Dashboard'],['visao','Visão Operacional']]},
  {label:'GESTÃO', items:[['setores','Setores'],['funcionarios','Funcionários'],['cargos','Cargos'],['escalas','Escalas'],['frequencia','Frequência'],['atestados','Atestados'],['uniformes','Uniformes']]},
  {label:'OPERAÇÃO', items:[['estoque','Estoque'],['contratos','Contratos'],['ocorrencias','Ocorrências']]},
  {label:'ANÁLISES', items:[['relatorios','Relatórios']]},
  {label:'SISTEMA', items:[['usuarios','Usuários'],['configuracoes','Configurações']]},
]

export const initials = (name: string) => name.split(' ').slice(0,2).map(p => p[0]).join('')
export const moduleLabels: Record<string,string> = Object.fromEntries(navGroups.flatMap(group => group.items))

export type Employee = typeof employees[number]
export type Sector = typeof sectors[number]
export type InventoryItem = typeof inventory[number]
export type Contract = typeof contracts[number]
export type Frequency = typeof frequencies[number]
export type Occurrence = typeof occurrences[number]
export type NavItem = [string, string]

export function statusTone(status: string) {
  if (/ativo|presente|normal|completo|em operação/i.test(status)) return 'success'
  if (/atenção|pendente|atraso|próximo|férias/i.test(status)) return 'warning'
  if (/vencido|falta|desligado|abaixo/i.test(status)) return 'danger'
  return 'neutral'
}

export function getModuleData(key: string) {
  if (key === 'setores') return sectors
  if (key === 'funcionarios') return employees
  if (key === 'frequencia') return frequencies
  if (key === 'estoque') return inventory
  if (key === 'contratos') return contracts
  if (key === 'ocorrencias') return occurrences
  return []
}

export function getModuleMeta(key: string) {
  const meta: Record<string,{title:string;subtitle:string;action?:string}> = {
    setores:{title:'Setores',subtitle:'Organize suas unidades e operações.',action:'Novo setor'}, funcionarios:{title:'Funcionários',subtitle:'Gerencie as pessoas que fazem sua operação acontecer.',action:'Novo funcionário'}, cargos:{title:'Cargos',subtitle:'Estruture funções e responsabilidades.',action:'Novo cargo'}, escalas:{title:'Escalas',subtitle:'Planeje jornadas e turnos com clareza.',action:'Nova escala'}, frequencia:{title:'Frequência',subtitle:'Acompanhe a presença da sua equipe.',action:'Registrar ocorrência'}, atestados:{title:'Atestados',subtitle:'Controle documentos e períodos de afastamento.',action:'Novo atestado'}, uniformes:{title:'Uniformes',subtitle:'Acompanhe entregas e pendências por funcionário.',action:'Registrar entrega'}, estoque:{title:'Estoque',subtitle:'Controle materiais por setor e evite rupturas.',action:'Nova movimentação'}, contratos:{title:'Contratos',subtitle:'Monitore vigências, clientes e equipes previstas.',action:'Novo contrato'}, ocorrencias:{title:'Ocorrências',subtitle:'Registre e acompanhe acontecimentos da operação.',action:'Registrar ocorrência'}, relatorios:{title:'Relatórios',subtitle:'Informação operacional pronta para decisão.',action:'Gerar relatório'}, usuarios:{title:'Usuários',subtitle:'Gerencie acessos e permissões da plataforma.',action:'Novo usuário'}, configuracoes:{title:'Configurações',subtitle:'Ajuste preferências e regras do sistema.'}
  }
  return meta[key] || {title:'Visão operacional',subtitle:'Acompanhe sua operação em um único lugar.'}
}

export const tableColumns: Record<string,string[]> = {
  setores:['Setor','Tipo','Endereço','Responsável','Funcionários','Escala','Status','Contrato'], funcionarios:['Funcionário','Cargo','Setor','Turno','Escala','Entrada','Saída','Status'], frequencia:['Funcionário','Setor','Data','Entrada','Saída','Status','Observação'], estoque:['Item','Categoria','Unidade','Atual','Mínimo','Máximo','Status'], contratos:['Contrato','Cliente','Setor','Início','Término','Status'], ocorrencias:['Data','Setor','Funcionário','Tipo','Descrição','Responsável']
}

export const searchItems = [
  {group:'Funcionários',title:'João da Silva',detail:'Auxiliar de Limpeza · Grajaú'}, {group:'Funcionários',title:'Maria Oliveira',detail:'Supervisora · Grajaú'}, {group:'Setores',title:'Grajaú',detail:'Armazém Solidário · 12 funcionários'}, {group:'Setores',title:'Cidade Tiradentes',detail:'Armazém Solidário · 10 funcionários'}, {group:'Contratos',title:'Contrato Grajaú',detail:'Prefeitura Regional Sul · Ativo'},
]

export const todayOperation = [{sector:'Grajaú', team:12, present:11, absent:1, status:'Atenção'}, {sector:'Cidade Tiradentes',team:10,present:10,absent:0,status:'Normal'}, {sector:'São Miguel',team:8,present:8,absent:0,status:'Normal'}, {sector:"M'Boi Mirim",team:7,present:6,absent:1,status:'Atenção'}]
export const upcoming = employees.slice(0,5)
export const kpis = [{label:'Funcionários',value:'42',caption:'Ativos',icon:'users',accent:'orange'}, {label:'Setores',value:'8',caption:'Em operação',icon:'building',accent:'blue'}, {label:'Presentes hoje',value:'38',caption:'90,5%',icon:'check',accent:'green'}, {label:'Ausentes',value:'2',caption:'Hoje',icon:'userx',accent:'red'}, {label:'Atestados',value:'2',caption:'Em andamento',icon:'file',accent:'purple'}, {label:'Contratos',value:'6',caption:'Ativos',icon:'briefcase',accent:'cyan'}, {label:'Uniformes',value:'7',caption:'Pendências',icon:'shirt',accent:'yellow'}, {label:'Alertas',value:'5',caption:'Precisam de atenção',icon:'bell',accent:'orange'}]

export const frequentColumns = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']
export const calendarRows = [{name:'João da Silva',days:['Trabalho','Trabalho','Folga','Trabalho','Trabalho','Trabalho','Folga']},{name:'Maria Oliveira',days:['Trabalho','Atestado','Atestado','Trabalho','Trabalho','Folga','Folga']},{name:'Carlos Santos',days:['Folga','Trabalho','Trabalho','Trabalho','Falta','Trabalho','Trabalho']}]
export const attestations = [{employee:'Maria Oliveira',start:'24/08/2026',end:'26/08/2026',days:'3 dias',status:'Em andamento'}, {employee:'João da Silva',start:'18/08/2026',end:'18/08/2026',days:'1 dia',status:'Encerrado'}]
export const uniforms = [{employee:'João da Silva',sector:'Grajaú',shirt:'M',pants:'42',shoes:'40',pending:'Calça'}, {employee:'Maria Oliveira',sector:'Grajaú',shirt:'G',pants:'44',shoes:'38',pending:'—'}, {employee:'Carlos Santos',sector:'Cidade Tiradentes',shirt:'M',pants:'40',shoes:'41',pending:'—'}, {employee:'Pedro Henrique',sector:"M'Boi Mirim",shirt:'G',pants:'42',shoes:'42',pending:'Camisa'}]
export const roles = ['Equipe de Limpeza','Controle de Acesso','Auxiliar de Serviços Gerais','Supervisor','Coordenador','Porteiro','Zelador'].map((name, i) => ({name, description:i < 2 ? 'Responsável pela rotina operacional do setor.' : 'Função cadastrada na estrutura operacional.', status:'Ativo', people:[12,7,9,3,2,5,4][i]}))
export const users = [{name:'Wagner Oliveira',email:'wagner@holandaops.com',role:'Administrador',status:'Ativo'}, {name:'Carla Mendes',email:'carla@holandaops.com',role:'Gestor',status:'Ativo'}, {name:'Rafael Souza',email:'rafael@holandaops.com',role:'Supervisor',status:'Ativo'}, {name:'Bruno Lima',email:'bruno@holandaops.com',role:'Operacional',status:'Ativo'}]
