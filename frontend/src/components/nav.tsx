import React from 'react';
import { logout } from '@/components/api';

interface NavProps {
  isLogin: '' | boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<'' | boolean>>;
  setAccessToken: React.Dispatch<React.SetStateAction<string>>;
  setIsOllamaUrl: React.Dispatch<React.SetStateAction<boolean>>;
}

const Nav: React.FC<NavProps> = ({
  isLogin,
  setIsLogin,
  setAccessToken,
  setIsOllamaUrl,
}) => {
  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await logout();
      alert(data.message);
      setIsLogin(false);
      setAccessToken('');
    } catch (error: any) {
      alert(`請聯絡管理員！\n${error?.detail || error}`);
    }
  };

  return (
    <nav className='w-full h-[5%] flex items-center justify-between p-4 max-md:p-2'>
      <div className='size-fit'>
        <ul>
          <li>
            <a className='block font-bold text-2xl max-md:text-xl' href='#'>
              Ollavatar
            </a>
          </li>
        </ul>
      </div>
      <div className='size-fit'>
        {isLogin ? (
          <ul className='flex gap-4 text-xl max-md:text-base max-md:gap-2'>
            <li className='hover:underline hover:underline-offset-4'>
              <a
                className='block cursor-pointer'
                onClick={() => setIsOllamaUrl(false)}
              >
                OllamaURL
              </a>
            </li>
            <li className='hover:underline hover:underline-offset-4'>
              <a className='block cursor-pointer' onClick={handleLogout}>
                登出
              </a>
            </li>
          </ul>
        ) : null}
      </div>
    </nav>
  );
};

export default Nav;
