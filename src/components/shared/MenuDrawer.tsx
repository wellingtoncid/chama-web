import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, X, ChevronRight, User, LayoutDashboard, MessageSquare, BookOpen } from 'lucide-react';
import { api } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import { isInternal as isInternalRole, isExternal as isExternalRole, isSuperAdmin as isSuperAdminRole, isDriver as isDriverRole, isCompany as isCompanyRole } from '@/constants/roleUtils';
import { buildMenuSections } from '@/constants/dashboardMenuItems';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [isAuthor, setIsAuthor] = useState(false);

  const fetchUserModules = useCallback(async () => {
    try {
      const res = await api.get('/user/modules');
      if (res.data?.success) {
        const modules = res.data.data.modules || [];
        const active = modules.filter((m: any) => m.is_active).map((m: any) => m.key);
        setActiveModules(active);
      }
    } catch (e) {
      // Silently fail (401 = token expired)
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchUserModules();
  }, [fetchUserModules, user]);

  useEffect(() => {
    if (!user) return;
    const fetchAuthorStatus = async () => {
      try {
        const res = await api.get('/article-author-status');
        if (res.data?.success) {
          setIsAuthor(res.data.data.is_author);
        }
      } catch (e) {
        // Silently fail
      }
    };
    fetchAuthorStatus();
  }, [user]);

  const role = String(user?.role || '').toLowerCase();
  const isInternal = isInternalRole(role);
  const isSuperAdmin = isSuperAdminRole(role);
  const isExternal = isExternalRole(role);
  const isDriver = isDriverRole(role);
  const isCompany = isCompanyRole(role);

  const menuSections = buildMenuSections(role, activeModules, isSuperAdmin, isInternal, isExternal, isCompany, isDriver, isAuthor);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    authLogout();
    onClose();
    window.location.href = '/';
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Drawer - Right side */}
      <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-950 z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <span className="font-bold text-slate-600 dark:text-slate-300">{user?.name?.charAt(0) || 'U'}</span>
              </div>
            )}
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{role}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => handleNavigate('/dashboard')}
              className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LayoutDashboard size={18} className="text-[#1f4ead]" />
              <span className="text-xs font-bold">Início</span>
            </button>
            <button 
              onClick={() => handleNavigate('/dashboard/chat')}
              className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MessageSquare size={18} className="text-[#1f4ead]" />
              <span className="text-xs font-bold">Mensagens</span>
            </button>
          </div>
        </div>

        {/* Menu Content - Scrollable */}
        <div className="flex-1 overflow-y-auto py-4">
          {menuSections.map((section, sectionIndex) => {
            if (section.visible === false) return null;
            
            return (
              <div key={sectionIndex} className="mb-4">
                {section.title && (
                  <h3 className="px-4 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-0.5">
                  {section.items.filter(item => item.visible !== false).map((item, itemIndex) => {
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                    
                    return (
                      <button
                        key={itemIndex}
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all ${
                          isActive 
                            ? 'bg-[#1f4ead]/10 text-[#1f4ead] dark:text-blue-400' 
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                        } ${item.highlight ? 'border-l-4 border-orange-500' : ''}`}
                      >
                        <span className={isActive ? 'text-[#1f4ead]' : 'text-slate-400'}>
                          {item.icon}
                        </span>
                        <span className={`text-sm font-medium flex-1 text-left ${item.highlight ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                          {item.label}
                        </span>
                        <ChevronRight size={16} className={`text-slate-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer - Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sair da conta</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MenuDrawer;