'use client';

import { useState } from 'react';
import { signUp, logIn } from '@/components/api';

type AccountProps = {
  setIsLogin: React.Dispatch<React.SetStateAction<'' | boolean>>;
  accessToken: string;
  setAccessToken: React.Dispatch<React.SetStateAction<string>>;
};

const Account = ({ setIsLogin, accessToken, setAccessToken }: AccountProps) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('signup');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (activeTab === 'signup') {
        if (process.env.NODE_ENV === 'development') {
          if (!username || !password) {
            alert('用戶名與密碼不得為空！');
            return;
          }

          const data = await signUp(username, password);
          alert(data.message);
          setActiveTab('login');
        } else {
          alert('此功能尚未開啟');
          setActiveTab('login');
        }
      } else if (activeTab === 'login') {
        if (!username || !password) {
          alert('用戶名與密碼不得為空！');
          return;
        }

        const data = await logIn(username, password);
        alert(data.message);
        setIsLogin(true);
        setAccessToken(data.access_token);
      }
    } catch (error: any) {
      if (
        error?.detail == '用戶名已註冊！' ||
        error?.detail == '用戶名錯誤！' ||
        error?.detail == '密碼錯誤！'
      ) {
        alert(error?.detail);
      } else {
        alert(`${error?.detail} 請聯絡管理員`);
      }
    }
  };

  return (
    <div className='fixed top-0 left-0 z-50 w-full h-full flex items-center justify-center'>
      <div className='z-0 absolute w-full h-full bg-black opacity-80 flex justify-center items-center'></div>
      <div className='z-1 w-1/2 h-1/2 bg-gray-900 flex flex-col items-center justify-center rounded-lg'>
        <div className='w-full h-1/10 flex'>
          {/* 註冊按鈕 */}
          <button
            onClick={() => setActiveTab('signup')}
            className={`w-full p-2 text-xl transition-colors cursor-pointer
          ${
            activeTab === 'signup'
              ? 'bg-gray-950 text-white'
              : 'bg-white text-black hover:bg-gray-900 hover:text-white active:bg-gray-950'
          }`}
          >
            註冊
          </button>

          {/* 登入按鈕 */}
          <button
            onClick={() => setActiveTab('login')}
            className={`w-full p-2 text-xl transition-colors cursor-pointer
          ${
            activeTab === 'login'
              ? 'bg-gray-950 text-white'
              : 'bg-white text-black hover:bg-gray-900 hover:text-white active:bg-gray-950'
          }`}
          >
            登入
          </button>
        </div>
        <form
          onSubmit={handleLogin}
          className='flex flex-col justify-center items-center gap-4 p-4 w-full h-9/10 text-xl text-black'
        >
          <input
            type='text'
            placeholder='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='w-4/5 bg-white p-2 rounded appearance-none'
          />
          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-4/5 bg-white border p-2 rounded'
          />
          <button
            type='submit'
            className='w-4/5 bg-gray-500 text-white rounded p-2 transition-colors cursor-pointer hover:bg-gray-950 active:bg-gray-950'
          >
            {activeTab === 'signup' ? '註冊' : '登入'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Account;
