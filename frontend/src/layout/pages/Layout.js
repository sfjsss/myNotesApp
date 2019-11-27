import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import plusIcon from '../../assets/images/plusIcon.svg';
import logoutIcon from '../../assets/images/logoutIcon.svg';
import classes from './Layout.module.css';
import * as actions from '../../store/actions/index';

import Navbar from 'react-bootstrap/Navbar';

class Layout extends Component {
    logoutHandler = () => {
        this.props.onLogout();
    }

    render () {
        return (
            <div>
                <Navbar bg="light" expand="true" className={classes.NavContentInMobile}>
                    <Link to="/addNote"><img alt="addNote" src={plusIcon} /></Link>
                    <Navbar.Brand href="/notes">MyNotes</Navbar.Brand>
                    <img alt="logout" onClick={this.logoutHandler} src={logoutIcon} />
                </Navbar>
                <Navbar bg="light" expand="true" className={classes.NavContentInLg}>
                    <Navbar.Brand href="/notes">MyNotes</Navbar.Brand>
                    <div className={classes.Nav}>
                        <Link to="/addNote"><button className="btn btn-primary">Add</button></Link>
                        <button onClick={this.logoutHandler} className="btn btn-outline-danger">Logout</button>
                    </div>
                </Navbar>
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onLogout: () => dispatch(actions.logout())
    }
}

export default connect(null, mapDispatchToProps)(Layout);