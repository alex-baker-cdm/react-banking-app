import { Link } from 'react-router-dom';

// components
import Layout from '../components/Layout/Layout';
import Divider from '../components/Divider/Divider';

// context
import { useTheme } from '../context/ThemeContext';

import type { ThemeName } from '../context/ThemeContext';

interface ThemeOption {
  name: ThemeName;
  label: string;
  icon: string;
  colors: string[];
}

const themes: ThemeOption[] = [
  {
    name: 'default',
    label: 'Default',
    icon: 'light_mode',
    colors: ['#667eea', '#764ba2'],
  },
  {
    name: 'ocean',
    label: 'Ocean',
    icon: 'water',
    colors: ['#2193b0', '#6dd5ed'],
  },
  {
    name: 'sunset',
    label: 'Sunset',
    icon: 'wb_twilight',
    colors: ['#f12711', '#f5af19'],
  },
  {
    name: 'forest',
    label: 'Forest',
    icon: 'forest',
    colors: ['#134e5e', '#71b280'],
  },
  {
    name: 'midnight',
    label: 'Midnight',
    icon: 'dark_mode',
    colors: ['#0f0c29', '#302b63'],
  },
  {
    name: 'rose',
    label: 'Rose',
    icon: 'local_florist',
    colors: ['#ee9ca7', '#ffdde1'],
  },
];

const ThemeSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Layout>
      <Divider />

      <div className='flex flex-v-center' style={{ marginBottom: '20px' }}>
        <Link to='/profile' style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
          <span className='material-symbols-outlined'>arrow_back</span>
        </Link>
        <h1 className='title' style={{ marginBottom: 0 }}>
          Appearance
        </h1>
      </div>

      <p className='information' style={{ textAlign: 'center', marginBottom: '30px' }}>
        Choose a theme for your banking app
      </p>

      <div className='theme-grid'>
        {themes.map((option) => (
          <button
            key={option.name}
            type='button'
            className={`theme-card ${theme === option.name ? 'theme-card-active' : ''}`}
            onClick={() => setTheme(option.name)}
          >
            <div
              className='theme-preview'
              style={{
                background: `linear-gradient(135deg, ${option.colors[0]}, ${option.colors[1]})`,
              }}
            >
              <span
                className='material-symbols-outlined'
                style={{ fontSize: '2em', color: '#fff' }}
              >
                {option.icon}
              </span>
            </div>
            <span className='theme-label'>{option.label}</span>
            {theme === option.name && (
              <span
                className='material-symbols-outlined theme-check'
                style={{ color: '#4ed34e', fontSize: '1.2em' }}
              >
                check_circle
              </span>
            )}
          </button>
        ))}
      </div>

      <Divider />

      <div
        className='account'
        style={{ padding: '20px', textAlign: 'center', fontSize: '0.9em', color: '#bbbbbb' }}
      >
        <p>Theme preferences are saved automatically and will persist across sessions.</p>
      </div>

      <Divider />
    </Layout>
  );
};

export default ThemeSettings;
