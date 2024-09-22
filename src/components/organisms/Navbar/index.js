// import React, {  useState } from 'react';
// import Styles from './style.module.css';
// import logo from './../../../assets/imgs/LOGO.jpeg';
// import { connect, useSelector } from 'react-redux';
// import {  withRouter } from 'react-router-dom';
// import { setUser, resetUser } from '../../../utils/redux/actions';
// // import { Reset_DATA } from '../../../utils/redux/actions/commonActions';
// import { useHistory } from 'react-router-dom';
// // import ClientSelect from "./ClientSelect";

// const Header = (props) => {
//   const { userInfo } = useSelector((state) => state.user);
//   const navigate = useHistory();
//   const [toggleBar, setToggleBar] = useState(false);

//   return (
//     <nav className="navbar navbar-expand-md navbar-dark" id="banner">
//       <div className="container-fluid" style={{ paddingLeft: '13px' }}>
//         {/* <!-- Brand --> */}
//         <a className="navbar-brand d-md-flex align-items-end" href="/dashboard">
//           <img src={logo} className={Styles.Icon} alt="brandLogo" />
//         </a>
//         {/* <h4 className="title mb-0 d-none d-lg-block">SIZ</h4> */}

//         <h5 className={['mb-0', Styles.headerText].join(' ')}>Order Management Dashboard</h5>
//         {/* <!-- Toggler/collapsibe Button --> */}
//         <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#collapsibleNavbar" onClick={() => setToggleBar(!toggleBar)}>
//           <span className="navbar-toggler-icon"></span>
//         </button>

//         {/* <!-- Navbar links --> */}
//         <div className="collapse navbar-collapse" id="collapsibleNavbar" style={{ display: toggleBar === true ? 'block' : 'none' }}>
//           <ul className="navbar-nav ml-auto">
//             {/* change dropdown start  */}
//             {/* <!-- Dropdown --> */}
//             <li>
//               <div className="d-flex flex-column">
//                 <a href="/dashboard" className="m-2 titles">
//                   Orders
//                 </a>
//               </div>
//             </li>
//             <li>
//               <div className="d-flex flex-column">
//                 {userInfo?.loggedUser.role.role_name === 'Admin' && (
//                   <a href="/lendersignup" className="m-2 titles">
//                     Users
//                   </a>
//                 )}
//               </div>
//             </li>

//             <li>
//               <div className="d-flex flex-column">
//                 {userInfo?.loggedUser.role.role_name === 'Admin' && (
//                   <a href="/contacts" className="m-2 titles">
//                     Contacts
//                   </a>
//                 )}
//               </div>
//             </li>

//             <li>
//               <div className="d-flex flex-column">
//                 {userInfo?.loggedUser.role.role_name === 'Admin' && (
//                   <a href="/campaigns" className="m-2 titles">
//                     Campaigns
//                   </a>
//                 )}
//               </div>
//             </li>
//             <li>
//               <div className="d-flex flex-column">
//                 {userInfo?.loggedUser.role.role_name === 'Admin' && (
//                   <a href="/templates" className="m-2 titles">
//                     Templates
//                   </a>
//                 )}
//               </div>
//             </li>

//             <li>
//               <div className="d-flex flex-column" style={{ color: 'black' }}></div>
//             </li>
//             <li className="nav-item dropdown d-lg-block">
//               {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}

//               {/* <a href="/"> */}

//               <div className="dropdown">
//                 <button
//                   className="btn dropdown-toggle dropdown"
//                   type="button"
//                   id="userDropdown"
//                   data-toggle="dropdown"
//                   aria-haspopup="true"
//                   aria-expanded="false"
//                 >
//                   {/* <img src={UserIcon} style={{height:30,background:'none'}} className="" alt="User Icon" /> */}
//                   <span>
//                     {userInfo?.loggedUser?.first_name} {userInfo?.loggedUser?.last_name}
//                   </span>
//                   {/* <span>{userInfo?.loggedUser?.phone_number}</span> */}
//                 </button>
//                 <div className="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
//                   <a className="dropdown-item" href="#">
//                     Profile
//                   </a>
//                   <button
//                     className="dropdown-item"
//                     onClick={() => {
//                       props.setUser({
//                         userInfo: {},
//                       });
//                       resetUser({});
//                       navigate.push('/');
//                     }}
//                   >
//                     Logout
//                   </button>
//                 </div>
//               </div>
//               {/* </a> */}
//               {/* <a
//                 className="nav-link dropdown-toggle"
//                 href="#"
//                 id="navbardrop"
//                 data-toggle="dropdown"
//               >
//                 <span className="rounded-icons profileIcon">
//                 <i className="fa fa-user" aria-hidden="true"></i>
//                 </span>
//               </a>
//               <div className="dropdown-menu">
//                 <a
//                   className="dropdown-item"
//                   href="/"
//                   onClick={() => {
//                     props.setUser({
//                       userInfo: {},
//                     });
//                     props.Reset_DATA({});
//                   }}
//                 >
//                   Logout
//                 </a>
//               </div>
//             </li>

//             <li className="nav-item d-lg-none d-lg-block">
//               <b className={Styles.supportText}>
//                 <span className="rounded-icons calenderIcon">
//                   <i className="bi bi-box-arrow-left"></i>
//                 </span>
//                 <span>
//                   <a
//                     className="dropdown-item"
//                     href="/"
//                     onClick={() => {
//                       props.setUser({
//                         userInfo: {},
//                       });
//                       props.Reset_DATA({});
//                     }}
//                   >
//                     Logout
//                   </a>
//                 </span>
//               </b> */}
//             </li>
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default connect((state) => ({ user: state.user }), {
//   setUser,
//   resetUser,
// })(withRouter(Header));
