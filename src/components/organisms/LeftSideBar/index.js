import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import styles from './Navbar.module.css';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const SideNavbar = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 767);
  const { userInfo } = useSelector((state) => state.user);
  const location = useLocation(); // Get the current location

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 767);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isActive = (route) => location.pathname === route;

  return (
    <>
      {isSmallScreen ? (
        <Navbar key="" expand="md" className={styles.smallNavbarContainer}>
          <Container fluid className="w-100">
            <Navbar.Toggle className={styles.navbarToggleButton} bsPrefix="navbar-toggler" />

            <Navbar.Offcanvas id={`offcanvasNavbar-expand-md`} aria-labelledby={`offcanvasNavbarLabel-expand-md`} placement="start" className={styles.offcanvas}>
              <Offcanvas.Header closeButton className={styles.offCanvasHeader}></Offcanvas.Header>
              <Offcanvas.Body className={styles.offcanvasBody}>
                <Nav className={'flex-grow-1 pe-3'}>
                  <Navbar.Brand href="#" className="m-auto">
                    <h1 className={[styles.navBarTitle, 'text-center'].join(' ')}>SIZ</h1>
                  </Navbar.Brand>
                  <Nav.Link href="dashboard" className={`${styles.navLink} ${isActive('/dashboard') ? styles.activeNavLink : ''}`}>
                    <img className={styles.vectorIcon} src={require('../../../assets/imgs/order.png')} alt="Home Icon" />
                    Orders
                  </Nav.Link>
                  <Nav.Link href="users" className={`${styles.navLink} ${isActive('/users') ? styles.activeNavLink : ''}`}>
                    <img className={styles.vectorIcon} src={require('../../../assets/imgs/users.png')} alt="Profile Icon" />
                    Users
                  </Nav.Link>
                  <Nav.Link href="contacts" className={`${styles.navLink} ${isActive('/contacts') ? styles.activeNavLink : ''}`}>
                    <img className={styles.vectorIcon} src={require('../../../assets/imgs/contacts.png')} alt="Settings Icon" />
                    Contacts
                  </Nav.Link>
                  <Nav.Link href="campaigns" className={`${styles.navLink} ${isActive('/campaigns') ? styles.activeNavLink : ''}`}>
                    <img className={styles.vectorIcon} src={require('../../../assets/imgs/campaigns.png')} alt="On-Site Icon" />
                    Campaigns
                  </Nav.Link>
                  <Nav.Link href="templates" className={`${styles.navLink} ${isActive('/templates') ? styles.activeNavLink : ''}`}>
                    <img className={styles.vectorIcon} src={require('../../../assets/imgs/templates.png')} alt="Documents Icon" />
                    Templates
                  </Nav.Link>
                  {/* <div className={styles.divider} /> */}
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      ) : (
        <Navbar className={styles.navbarContainer}>
          <Navbar.Brand href="#profile" className={styles.navbarBrand}>
            {/* <div className={styles.profileContainer}>
              <img src={require('../../../assets/imgs/sizlogo.png')} alt="Profile" className={styles.profileImage} />
            </div>
            <h4 className={styles.username}> {`${userInfo.loggedUser.first_name} ${userInfo.loggedUser.last_name}`}</h4>
            <h4 className={`${styles.username} fontWeight-400`}>{`${userInfo.loggedUser.email}`}</h4> */}
          </Navbar.Brand>

          <Nav className="flex-column mt-5 w-100">
            {userInfo?.loggedUser?.role?.role_name === 'Admin' ? (
              <>
                <Nav.Link href="dashboard" className={`${styles.navLink} ${isActive('/dashboard') ? styles.activeNavLink : ''}`}>
                  <img className={styles.vectorIcon} src={require('../../../assets/imgs/order.png')} alt="Home Icon" />
                  Orders
                </Nav.Link>
                <Nav.Link href="users" className={`${styles.navLink} ${isActive('/users') ? styles.activeNavLink : ''}`}>
                  <img className={styles.vectorIcon} src={require('../../../assets/imgs/users.png')} alt="Profile Icon" />
                  Users
                </Nav.Link>
                <Nav.Link href="contacts" className={`${styles.navLink} ${isActive('/contacts') ? styles.activeNavLink : ''}`}>
                  <img className={styles.vectorIcon} src={require('../../../assets/imgs/contacts.png')} alt="Settings Icon" />
                  Contacts
                </Nav.Link>
                <Nav.Link href="campaigns" className={`${styles.navLink} ${isActive('/campaigns') ? styles.activeNavLink : ''}`}>
                  <img className={styles.vectorIcon} src={require('../../../assets/imgs/campaigns.png')} alt="On-Site Icon" />
                  Campaigns
                </Nav.Link>
                <Nav.Link href="templates" className={`${styles.navLink} ${isActive('/templates') ? styles.activeNavLink : ''}`}>
                  <img className={styles.vectorIcon} src={require('../../../assets/imgs/templates.png')} alt="Documents Icon" />
                  Templates
                </Nav.Link>
              </>
            ) : (
              <>
                {userInfo?.loggedUser?.permission.map((i) => {
                  // Always return the JSX inside the map function
                  return (
                    <>
                      {i.name === 'Order Management' && (
                        <Nav.Link href="dashboard" className={`${styles.navLink} ${isActive('/dashboard') ? styles.activeNavLink : ''}`}>
                          <img className={styles.vectorIcon} src={require('../../../assets/imgs/order.png')} alt="Home Icon" />
                          Orders
                        </Nav.Link>
                      )}
                      {i.name.includes('User Management') && (
                        <Nav.Link href="users" className={`${styles.navLink} ${isActive('/users') ? styles.activeNavLink : ''}`}>
                          <img className={styles.vectorIcon} src={require('../../../assets/imgs/users.png')} alt="Profile Icon" />
                          Users
                        </Nav.Link>
                      )}
                      {i.name.includes('Contact Management') && (
                        <Nav.Link href="contacts" className={`${styles.navLink} ${isActive('/contacts') ? styles.activeNavLink : ''}`}>
                          <img className={styles.vectorIcon} src={require('../../../assets/imgs/contacts.png')} alt="Settings Icon" />
                          Contacts
                        </Nav.Link>
                      )}
                      {i.name.includes('Campaign Management') && (
                        <Nav.Link href="campaigns" className={`${styles.navLink} ${isActive('/campaigns') ? styles.activeNavLink : ''}`}>
                          <img className={styles.vectorIcon} src={require('../../../assets/imgs/campaigns.png')} alt="On-Site Icon" />
                          Campaigns
                        </Nav.Link>
                      )}
                      {i.name.includes('Whatsapp Template Management') && (
                        <Nav.Link href="templates" className={`${styles.navLink} ${isActive('/templates') ? styles.activeNavLink : ''}`}>
                          <img className={styles.vectorIcon} src={require('../../../assets/imgs/templates.png')} alt="Documents Icon" />
                          Templates
                        </Nav.Link>
                      )}
                    </>
                  );
                })}
              </>
            )}
          </Nav>
        </Navbar>
      )}
    </>
  );
};

export default SideNavbar;
