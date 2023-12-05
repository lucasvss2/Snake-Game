import { Link } from 'react-router-dom';
import './home.modules.css'
import Logo from './assets/logo.png'
export default function Home() {
  return (
    <div className='body'>
      <img src={Logo} alt="logo" className='logo'/>
      <Link to="/snake">
        <button>Start</button>
      </Link>
    </div>
  )
}