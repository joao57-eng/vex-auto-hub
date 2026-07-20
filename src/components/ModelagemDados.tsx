import React, { useState } from 'react';
import { Database, Table, Key, Link as LinkIcon, Info, HelpCircle } from 'lucide-react';

interface Column {
  name: string;
  type: string;
  key?: 'PK' | 'FK' | 'PK/FK';
  refTable?: string;
  nullable: boolean;
  desc: string;
}

interface TableModel {
  name: string;
  description: string;
  icon: string;
  columns: Column[];
}

const DATABASE_SCHEMA: TableModel[] = [
  {
    name: 'usuarios',
    description: 'Armazena as informações básicas de autenticação e identificação de todos os perfis do ecossistema.',
    icon: 'User',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', key: 'PK', nullable: false, desc: 'Identificador único (UUID)' },
      { name: 'nome', type: 'VARCHAR(150)', nullable: false, desc: 'Nome completo ou Razão Social' },
      { name: 'email', type: 'VARCHAR(100)', nullable: false, desc: 'E-mail principal para login e alertas (Único)' },
      { name: 'telefone', type: 'VARCHAR(20)', nullable: false, desc: 'Número do celular para alertas de WhatsApp' },
      { name: 'tipo_usuario', type: 'VARCHAR(20)', nullable: false, desc: 'Função: CLIENTE, PARCEIRO, ADMIN_VEX' },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, desc: 'Data e hora da criação do registro' },
    ]
  },
  {
    name: 'parceiros',
    description: 'Detalhes operacionais adicionais para prestadores de serviços, incluindo finanças e status de verificação.',
    icon: 'Briefcase',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', key: 'PK', nullable: false, desc: 'Identificador único' },
      { name: 'usuario_id', type: 'VARCHAR(36)', key: 'FK', refTable: 'usuarios', nullable: false, desc: 'Vínculo com a tabela usuarios' },
      { name: 'nome_fantasia', type: 'VARCHAR(150)', nullable: false, desc: 'Nome comercial exibido aos clientes' },
      { name: 'cnpj', type: 'VARCHAR(18)', nullable: false, desc: 'CNPJ do prestador (Único)' },
      { name: 'plano', type: 'VARCHAR(20)', nullable: false, desc: 'Assinatura: BASIC ou PREMIUM' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, desc: 'Status: PENDENTE, ATIVO, SUSPENSO' },
      { name: 'saldo_carteira', type: 'DECIMAL(10,2)', nullable: false, desc: 'Saldo atual para repasses financeiros acumulados' },
      { name: 'verificado', type: 'BOOLEAN', nullable: false, desc: 'Flag que indica aprovação pós-vistoria de qualidade VEX' },
      { name: 'mensalidade_paga_ate', type: 'DATE', nullable: true, desc: 'Validade do pagamento recorrente de mensalidade' },
      { name: 'latitude', type: 'DOUBLE PRECISION', nullable: false, desc: 'Latitude geográfica da base para busca por raio (PostGIS)' },
      { name: 'longitude', type: 'DOUBLE PRECISION', nullable: false, desc: 'Longitude geográfica da base para busca por raio (PostGIS)' },
    ]
  },
  {
    name: 'servicos_catalogo',
    description: 'Catálogo nacional dos serviços disponíveis, categorizados por fases de lançamento.',
    icon: 'Wrench',
    columns: [
      { name: 'id', type: 'VARCHAR(50)', key: 'PK', nullable: false, desc: 'Slug chave primária (ex: guincho_24h)' },
      { name: 'nome', type: 'VARCHAR(100)', nullable: false, desc: 'Nome do serviço automotivo' },
      { name: 'categoria', type: 'VARCHAR(50)', nullable: false, desc: 'Categoria lógica para filtragem' },
      { name: 'fase', type: 'INTEGER', nullable: false, desc: 'Fase de expansão: 1 (Lançamento), 2 (Próximas)' },
      { name: 'descricao', type: 'TEXT', nullable: false, desc: 'Explicação detalhada do escopo do serviço' },
      { name: 'faixa_preco_base', type: 'VARCHAR(50)', nullable: false, desc: 'Referência de valores padrão de mercado' },
    ]
  },
  {
    name: 'pedidos',
    description: 'Registra a jornada completa de atendimento, desde a solicitação inicial até a conclusão do serviço.',
    icon: 'Clipboard',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', key: 'PK', nullable: false, desc: 'Identificador único do pedido' },
      { name: 'cliente_id', type: 'VARCHAR(36)', key: 'FK', refTable: 'usuarios', nullable: false, desc: 'Cliente solicitante' },
      { name: 'servico_id', type: 'VARCHAR(50)', key: 'FK', refTable: 'servicos_catalogo', nullable: false, desc: 'Serviço requisitado' },
      { name: 'status', type: 'VARCHAR(30)', nullable: false, desc: 'Fluxo: AGUARDANDO_PROPOSTAS, APROVADO, EM_ANDAMENTO, CONCLUIDO' },
      { name: 'endereco_cliente', type: 'VARCHAR(255)', nullable: false, desc: 'Endereço informado para atendimento' },
      { name: 'geom_localizacao', type: 'GEOMETRY(Point, 4326)', nullable: false, desc: 'Coordenadas espaciais do cliente para PostGIS' },
      { name: 'parceiro_selecionado_id', type: 'VARCHAR(36)', key: 'FK', refTable: 'parceiros', nullable: true, desc: 'Parceiro escolhido pelo cliente' },
      { name: 'forma_pagamento', type: 'VARCHAR(20)', nullable: true, desc: 'Método: PIX ou CARTAO_CREDITO' },
      { name: 'total_pago', type: 'DECIMAL(10,2)', nullable: true, desc: 'Valor bruto cobrado do cliente' },
      { name: 'taxa_vex', type: 'DECIMAL(10,2)', nullable: true, desc: 'Comissão automática retida pela VEX' },
      { name: 'repasse_parceiro', type: 'DECIMAL(10,2)', nullable: true, desc: 'Valor líquido a ser creditado na carteira do parceiro' },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, desc: 'Data e hora da solicitação inicial' },
    ]
  },
  {
    name: 'orcamentos_propostas',
    description: 'Propostas enviadas por parceiros locais interessados em atender a um pedido ativo.',
    icon: 'FileText',
    columns: [
      { name: 'pedido_id', type: 'VARCHAR(36)', key: 'PK/FK', refTable: 'pedidos', nullable: false, desc: 'Vínculo do pedido correspondente' },
      { name: 'parceiro_id', type: 'VARCHAR(36)', key: 'PK/FK', refTable: 'parceiros', nullable: false, desc: 'Parceiro proponente' },
      { name: 'preco_proposto', type: 'DECIMAL(10,2)', nullable: false, desc: 'Valor bruto ofertado pelo serviço' },
      { name: 'tempo_estimado_chegada', type: 'VARCHAR(50)', nullable: false, desc: 'Janela de tempo prevista (ex: 25-40 min)' },
      { name: 'notas_adicionais', type: 'TEXT', nullable: true, desc: 'Observações, termos de garantia ou detalhes do prestador' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, desc: 'Status: PENDENTE, APROVADO, RECUSADO' },
      { name: 'enviado_em', type: 'TIMESTAMP', nullable: false, desc: 'Data e hora do envio do orçamento' },
    ]
  },
  {
    name: 'avaliacoes_pos_venda',
    description: 'Armazena o feedback, nota de estrelas e comentários, fortalecendo a confiança do marketplace.',
    icon: 'Star',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', key: 'PK', nullable: false, desc: 'Identificador único da avaliação' },
      { name: 'pedido_id', type: 'VARCHAR(36)', key: 'FK', refTable: 'pedidos', nullable: false, desc: 'Vínculo com o atendimento avaliado' },
      { name: 'cliente_id', type: 'VARCHAR(36)', key: 'FK', refTable: 'usuarios', nullable: false, desc: 'Autor da avaliação' },
      { name: 'parceiro_id', type: 'VARCHAR(36)', key: 'FK', refTable: 'parceiros', nullable: false, desc: 'Alvo da avaliação' },
      { name: 'nota', type: 'INTEGER', nullable: false, desc: 'Estrelas concedidas (1 a 5)' },
      { name: 'comentario', type: 'TEXT', nullable: true, desc: 'Relato livre do cliente sobre o atendimento' },
      { name: 'criado_em', type: 'TIMESTAMP', nullable: false, desc: 'Data e hora da avaliação' },
    ]
  },
  {
    name: 'transacoes_carteira',
    description: 'Histórico financeiro detalhado de pagamentos, comissões retidas e transferências de mensalidade.',
    icon: 'DollarSign',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', key: 'PK', nullable: false, desc: 'Código único da transação (ex: TX-XXXX)' },
      { name: 'pedido_id', type: 'VARCHAR(36)', key: 'FK', refTable: 'pedidos', nullable: true, desc: 'Vínculo opcional se for comissão de serviço' },
      { name: 'parceiro_id', type: 'VARCHAR(36)', key: 'FK', refTable: 'parceiros', nullable: false, desc: 'Parceiro associado à transação' },
      { name: 'tipo', type: 'VARCHAR(30)', nullable: false, desc: 'Tipo: COMISSAO_SERVICO, MENSALIDADE, SAQUE_EFETUADO' },
      { name: 'valor_bruto', type: 'DECIMAL(10,2)', nullable: false, desc: 'Montante financeiro integral' },
      { name: 'valor_comissao', type: 'DECIMAL(10,2)', nullable: false, desc: 'Taxa retida na operação pela VEX AUTO HUB' },
      { name: 'valor_liquido', type: 'DECIMAL(10,2)', nullable: false, desc: 'Repasse creditado ou debitado final' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, desc: 'Estado: PENDENTE, CONCLUIDO, FALHADO' },
      { name: 'data_operacao', type: 'TIMESTAMP', nullable: false, desc: 'Data e hora da efetivação' },
    ]
  }
];

export default function ModelagemDados({ isRedTheme }: { isRedTheme: boolean }) {
  const [selectedTable, setSelectedTable] = useState<string>('usuarios');

  const activeTable = DATABASE_SCHEMA.find(t => t.name === selectedTable) || DATABASE_SCHEMA[0];

  const primaryAccent = isRedTheme ? 'text-red-500' : 'text-amber-400';
  const primaryBg = isRedTheme ? 'bg-red-600' : 'bg-amber-500';
  const primaryBorder = isRedTheme ? 'border-red-500/20' : 'border-amber-500/20';
  const hoverBg = isRedTheme ? 'hover:bg-red-600/15' : 'hover:bg-amber-500/15';
  const selectedBg = isRedTheme ? 'bg-red-600/20 border-red-500/50' : 'bg-amber-500/20 border-amber-500/50';

  return (
    <div id="data-model" className="p-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
          <Database className={`w-8 h-8 ${primaryAccent}`} />
          <h2 className="text-2xl font-bold tracking-tight uppercase">Modelagem de Banco de Dados Relacional</h2>
        </div>
        <p className="text-gray-400 text-sm max-w-3xl">
          Arquitetura PostgreSQL pronta para produção, estruturada com suporte espacial (PostGIS) para busca inteligente de parceiros por raio de geolocalização e sistema de split financeiro automatizado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Tabela de Seleção (Esteras de Entidades) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-mono tracking-widest text-white/40 uppercase px-2 font-bold">Entidades Disponíveis</h3>
          <div className="space-y-2">
            {DATABASE_SCHEMA.map((table) => {
              const isSelected = table.name === selectedTable;
              return (
                <button
                  key={table.name}
                  onClick={() => setSelectedTable(table.name)}
                  className={`w-full text-left p-3 rounded-none border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                    isSelected ? `${selectedBg} text-white` : 'border-white/10 bg-neutral-900/60 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Table className={`w-4 h-4 ${isSelected ? primaryAccent : 'text-gray-500'}`} />
                    <span className="font-mono text-sm font-semibold">{table.name}</span>
                  </div>
                  {isSelected && <div className={`w-2 h-2 rounded-none ${primaryBg}`} />}
                </button>
              );
            })}
          </div>

          {/* Dica PostGIS */}
          <div className={`mt-6 p-4 rounded-none bg-neutral-900 border ${primaryBorder}`}>
            <div className="flex gap-2 items-start">
              <Info className={`w-5 h-5 ${primaryAccent} shrink-0 mt-0.5`} />
              <div>
                <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wide">Suporte a PostGIS Ativado</h4>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">
                  Utilizamos o tipo <code className="text-gray-250 font-mono text-[10px]">GEOMETRY(Point, 4326)</code> para calcular distâncias e estimar tempos de chegada entre cliente e o guincho/parceiro disponível mais próximo via SQL indexado de forma ultra-eficiente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detalhes da Tabela Ativa */}
        <div className="lg:col-span-8 bg-neutral-950 border border-white/10 rounded-none p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-none ${primaryBg}/20 ${primaryAccent} font-bold`}>TABLE</span>
                <h3 className="text-xl font-bold font-mono tracking-tight text-white">{activeTable.name}</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed max-w-2xl">{activeTable.description}</p>
            </div>
          </div>

          {/* Grid de Colunas */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="border-b border-white/10 text-xs text-white/40 uppercase font-mono tracking-wider">
                  <th className="pb-3 pl-2">Coluna</th>
                  <th className="pb-3">Tipo de Dados</th>
                  <th className="pb-3">Chave</th>
                  <th className="pb-3">Nullable</th>
                  <th className="pb-3">Descrição Funcional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs">
                {activeTable.columns.map((col) => (
                  <tr key={col.name} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono font-medium text-gray-200 pl-2">{col.name}</td>
                    <td className="py-3 font-mono text-gray-400">{col.type}</td>
                    <td className="py-3">
                      {col.key ? (
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none text-[10px] font-mono ${
                          col.key === 'PK' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}>
                          <Key className="w-2.5 h-2.5" />
                          {col.key}
                          {col.refTable && <span className="text-gray-500">➜ {col.refTable}</span>}
                        </span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="py-3 font-mono text-gray-500">{col.nullable ? 'YES' : 'NO'}</td>
                    <td className="py-3 text-gray-300 max-w-xs sm:max-w-md">{col.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modelagem do Fluxo de Split */}
          {selectedTable === 'transacoes_carteira' && (
            <div className={`mt-6 p-4 rounded-none bg-neutral-900/50 border ${primaryBorder} space-y-2`}>
              <h4 className="text-xs font-semibold text-gray-200 flex items-center gap-2 uppercase tracking-wide">
                <LinkIcon className="w-3.5 h-3.5" />
                Mapeamento do Fluxo de Split Financeiro
              </h4>
              <p className="text-xs text-white/40 leading-relaxed">
                Quando o cliente confirma a conclusão do serviço, o gateway dispara um webhook que divide o <code className="text-gray-200 font-mono">total_pago</code> de um pedido:
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center py-2 bg-neutral-950/80 rounded-none border border-white/10 text-xs font-mono">
                <div className="text-center px-4">
                  <p className="text-white/30 text-[10px]">VALOR BRUTO (Cliente)</p>
                  <p className="text-white font-bold text-sm">R$ 100,00</p>
                </div>
                <div className="text-gray-600 font-bold">➜</div>
                <div className="text-center px-4 border-l border-white/10">
                  <p className="text-amber-500 text-[10px]">RETENÇÃO VEX (10%)</p>
                  <p className="text-amber-400 font-bold text-sm">R$ 10,00</p>
                </div>
                <div className="text-gray-600 font-bold">+</div>
                <div className="text-center px-4 border-l border-white/10">
                  <p className="text-green-500 text-[10px]">REPASSE PARCEIRO (90%)</p>
                  <p className="text-green-400 font-bold text-sm">R$ 90,00</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
