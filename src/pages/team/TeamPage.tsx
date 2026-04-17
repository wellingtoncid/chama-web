import { useState, useEffect } from 'react';
import { api } from '@/api/api';
import { 
  Users, UserPlus, Mail, Shield, MoreVertical,
  CheckClock, Trash2, Edit,
  Loader2, UserX, ChevronDown
} from 'lucide-react';
import Swal from 'sweetalert2';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  role: string;
  user_type?: string;
  status: string;
  created_at: string;
  avatar?: string;
}

interface Invitation {
  id: number;
  email: string;
  role: string;
  permissions: string;
  status: string;
  invited_by: number;
  company_id: number;
  inviter_name: string;
  created_at: string;
  expires_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  coordinator: 'Coordenador',
  employee: 'Funcionário',
  driver: 'Motorista',
};

const PERMISSIONS_OPTIONS = [
  { key: 'freights.view', label: 'Ver Fretes' },
  { key: 'freights.create', label: 'Criar Fretes' },
  { key: 'freights.edit', label: 'Editar Fretes' },
  { key: 'freights.delete', label: 'Excluir Fretes' },
  { key: 'marketplace.view', label: 'Ver Marketplace' },
  { key: 'marketplace.manage', label: 'Gerenciar Marketplace' },
  { key: 'financial.view', label: 'Ver Financeiro' },
  { key: 'financial.manage', label: 'Gerenciar Financeiro' },
  { key: 'team.manage', label: 'Gerenciar Equipe' },
  { key: 'reports.view', label: 'Ver Relatórios' },
];

export default function TeamPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteModal, setInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'employee',
    permissions: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersRes, invitesRes] = await Promise.all([
        api.get('/team').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/team/invitations').catch(() => ({ data: { success: false, data: [] } }))
      ]);

      if (membersRes.data?.success) {
        setMembers(membersRes.data.data || []);
      }
      if (invitesRes.data?.success) {
        setInvitations(invitesRes.data.data || []);
      }
    } catch {
      console.error('Erro ao carregar dados:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteForm.email) {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Email é obrigatório' });
      return;
    }

    try {
      setInviting(true);
      const res = await api.post('/team/invite', {
        email: inviteForm.email,
        role: inviteForm.role,
        permissions: inviteForm.permissions
      });

      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Convite Enviado!',
          html: `Convite enviado para <strong>${inviteForm.email}</strong><br/>
                 O link de convite foi copiado para sua área de transferência.`,
          confirmButtonText: 'Copiar Link'
        }).then(() => {
          navigator.clipboard.writeText(res.data.data.invite_link);
        });
        
        setInviteModal(false);
        setInviteForm({ email: '', role: 'employee', permissions: [] });
        loadData();
      } else {
        Swal.fire({ icon: 'error', title: 'Erro', text: res.data?.message || 'Erro ao enviar convite' });
      }
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'Erro', text: e.response?.data?.message || 'Erro ao enviar convite' });
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvite = async (id: number) => {
    const result = await Swal.fire({
      title: 'Cancelar Convite?',
      text: 'O convite será cancelado e não poderá ser usado.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sim, Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.post('/team/invitation/cancel', { id });
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Sucesso', text: 'Convite cancelado' });
        loadData();
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao cancelar convite' });
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    const result = await Swal.fire({
      title: 'Remover Membro?',
      text: `${member.name} será removido da equipe.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Remover'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.post('/team/member/remove', { user_id: member.id });
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Sucesso', text: 'Membro removido' });
        loadData();
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao remover membro' });
    }
  };

  const handleUpdateRole = async (memberId: number, newRole: string) => {
    try {
      const res = await api.post('/team/member/update', { 
        user_id: memberId, 
        role: newRole 
      });
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Sucesso', text: 'Cargo atualizado' });
        setEditingMember(null);
        loadData();
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao atualizar cargo' });
    }
  };

  const togglePermission = (permKey: string) => {
    setInviteForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permKey)
        ? prev.permissions.filter(p => p !== permKey)
        : [...prev.permissions, permKey]
    }));
  };

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center animate-pulse">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-500">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic">Gestão de Equipe</h2>
              <p className="text-slate-300 text-sm font-medium">
                Gerencie membros e convites da sua empresa
              </p>
            </div>
          </div>

          <button
            onClick={() => setInviteModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors"
          >
            <UserPlus size={18} />
            Convidar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'members'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users size={16} />
          Membros ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('invitations')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'invitations'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Mail size={16} />
          Convites ({invitations.filter(i => i.status === 'pending').length})
        </button>
      </div>

      {/* Members List */}
      {activeTab === 'members' && (
        <div className="space-y-3">
          {members.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center">
              <Users size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">Nenhum membro na equipe ainda.</p>
              <button
                onClick={() => setInviteModal(true)}
                className="mt-4 px-6 py-3 rounded-xl bg-orange-500 text-white font-bold"
              >
                Convidar Primeiro Membro
              </button>
            </div>
          ) : (
            members.map(member => (
              <div
                key={member.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 flex items-center gap-4 border border-slate-100 dark:border-slate-700"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold">{member.name?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white">{member.name}</h4>
                    {member.status === 'active' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-bold">Ativo</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">Inativo</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{member.email}</p>
                </div>

                {/* Role */}
                <div className="relative">
                  {editingMember?.id === member.id ? (
                    <select
                      value={editingMember.role}
                      onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                      className="px-3 py-2 rounded-xl border-2 border-orange-200 bg-white text-sm font-bold"
                      autoFocus
                      onBlur={() => handleUpdateRole(member.id, editingMember.role)}
                    >
                      {Object.entries(ROLE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => setEditingMember(member)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      <Shield size={14} />
                      {ROLE_LABELS[member.role] || member.role}
                      <ChevronDown size={14} />
                    </button>
                  )}
                </div>

                {/* Menu */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === member.id ? null : member.id)}
                    className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center"
                  >
                    <MoreVertical size={18} className="text-slate-400" />
                  </button>
                  
                  {menuOpen === member.id && (
                    <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 min-w-[160px] z-10">
                      <button
                        onClick={() => { setEditingMember(member); setMenuOpen(null); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <Edit size={14} /> Editar Cargo
                      </button>
                      <button
                        onClick={() => { handleRemoveMember(member); setMenuOpen(null); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-red-500"
                      >
                        <UserX size={14} /> Remover
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Invitations List */}
      {activeTab === 'invitations' && (
        <div className="space-y-3">
          {invitations.filter(i => i.status === 'pending').length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center">
              <Mail size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">Nenhum convite pendente.</p>
            </div>
          ) : (
            invitations.filter(i => i.status === 'pending').map(invite => (
              <div
                key={invite.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 flex items-center gap-4 border border-slate-100 dark:border-slate-700"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Mail size={20} className="text-amber-600" />
                </div>

                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">{invite.email}</h4>
                  <p className="text-sm text-slate-500">
                    Convite enviado por {invite.inviter_name} • {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-600 font-bold">
                  <Clock size={12} className="inline mr-1" />
                  Pendente
                </span>

                <button
                  onClick={() => handleCancelInvite(invite.id)}
                  className="w-10 h-10 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Invite Modal */}
      {inviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
              <h3 className="text-xl font-black uppercase italic flex items-center gap-3">
                <UserPlus size={24} />
                Convidar Novo Membro
              </h3>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Email do Colaborador
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="email@empresa.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Cargo
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Permissões
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PERMISSIONS_OPTIONS.map(perm => (
                    <label
                      key={perm.key}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                        inviteForm.permissions.includes(perm.key)
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={inviteForm.permissions.includes(perm.key)}
                        onChange={() => togglePermission(perm.key)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${
                        inviteForm.permissions.includes(perm.key)
                          ? 'bg-orange-500 text-white'
                          : 'border-2 border-slate-300'
                      }`}>
                        {inviteForm.permissions.includes(perm.key) && <Check size={12} />}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800 flex gap-3">
              <button
                onClick={() => setInviteModal(false)}
                className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleInvite}
                disabled={inviting}
                className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {inviting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Mail size={18} />
                    Enviar Convite
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
