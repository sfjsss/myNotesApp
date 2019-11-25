import React, { Component } from 'react';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import './App.css';
import * as actions from './store/actions/index';
import AuthenticationPage from './auth/pages/AuthenticationPage';
import Layout from './layout/pages/Layout';
import NotesList from './notesList/pages/NotesList';

class App extends Component {
    componentDidMount () {
        this.props.onTryAutoSignup();
    }

    render() {
        let content = (
            <Switch>
                <Route path="/auth" component={AuthenticationPage} />
                <Redirect to="/auth" />
            </Switch>
        )

        if (this.props.isAuthenticated) {
            content = (
                <Layout>
                    <Switch>
                        <Route path="/notes" component={NotesList} />
                        <Redirect to="/notes" />
                    </Switch>
                </Layout>
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
