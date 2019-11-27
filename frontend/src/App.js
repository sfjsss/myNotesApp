import React, { Component } from 'react';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import './App.css';
import * as actions from './store/actions/index';
import AuthenticationPage from './auth/pages/AuthenticationPage';
import Layout from './layout/pages/Layout';
import NotesList from './notesList/pages/NotesList';
import AddNote from './addNote/pages/AddNote';
import ViewNote from './notesList/pages/ViewNote';
import EditNote from './editNote/pages/EditNote';

class App extends Component {
    componentDidMount () {
        this.props.onTryAutoSignup();
    }

    render() {
        let content;

        if (this.props.isAuthenticated) {
            content = (
                <React.Fragment>
                    <Layout />
                    <Switch>
                        <Route path="/notes/edit/:nid" component={EditNote} />
                        <Route path="/notes/:nid" component={ViewNote} />
                        <Route path="/notes" component={NotesList} />
                        <Route path="/addNote" component={AddNote} />
                        <Redirect to="/notes" />
                    </Switch>
                </React.Fragment>
            )
        } else {
            content = (
                <Switch>
                    <Route path="/auth" component={AuthenticationPage} />
                    <Redirect to="/auth" />
                </Switch>
            )
        }
        return (
            <div>
                {content}
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        isAuthenticated: state.auth.token !== null
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onTryAutoSignup: () => dispatch(actions.authCheckState())
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
