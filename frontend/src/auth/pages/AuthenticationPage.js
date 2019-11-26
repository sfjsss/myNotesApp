import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as actions from '../../store/actions/index';

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import classes from './AuthenticationPage.module.css';

class AuthenticationPage extends Component {
    state = {
        form: {
            name: {
                value: "",
                valid: false,
                touched: false,
                validation: {
                    required: true,
                }
            },
            email: {
                value: "",
                valid: false,
                touched: false,
                validation: {
                    required: true,
                    isEmail: true
                }
            },
            password: {
                value: "",
                valid: false,
                touched: false,
                validation: {
                    required: true,
                    minLength: 6
                }
            }
        },
        isSignup: false
    }

    switchAuthModeHandler = () => {
        this.setState(prevState => {
            return {
                isSignup: !prevState.isSignup
            }
        })
    }

    checkValidity (value, rules) {
        let isValid = true;

        if (!rules) {
            return true;
        }

        if (rules.required) {
            isValid = value.trim() !== "" && isValid;
        }

        if (rules.minLength) {
            isValid = value.length >= rules.minLength && isValid;
        }

        if (rules.isEmail) {
            const pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
            isValid = pattern.test(value) && isValid;
        }

        return isValid;
    }

    inputChangedHandler = (event, fieldName) => {
        const updatedForm = {
            ...this.state.form,
            [fieldName]: {
                ...this.state.form[fieldName],
                value: event.target.value,
                valid: this.checkValidity(event.target.value, this.state.form[fieldName].validation),
                touched: true
            }
        }
        this.setState({form: updatedForm})
    }

    submitHandler = (event) => {
        event.preventDefault();
        if (this.state.isSignup) {
            this.props.onSignup(this.state.form.name.value, this.state.form.email.value, this.state.form.password.value);
        } else {
            this.props.onLogin(this.state.form.email.value, this.state.form.password.value);
        }
    }

    render () {
        let emailError = false;
        let credentialError = false;
        let emailInvalidFeedback = "Please enter a valid email";
        if (this.props.authError == 'emailError') {
            emailError = true;
            emailInvalidFeedback = "This email already exist";
        } else if (this.props.authError == 'credentialError') {
            credentialError = true;
        }

        let nameValidation;
        let emailValidation;
        let passValidation;
        let overallValidation = false;

        if (this.state.isSignup) {
            if (this.state.form.name.touched) {
                nameValidation = this.state.form.name.valid ? "is-valid" : "is-invalid";
            }
            if (this.state.form.email.touched) {
                emailValidation = this.state.form.email.valid && !emailError ? "is-valid" : "is-invalid";
            }
            if (this.state.form.password.touched) {
                passValidation = this.state.form.password.valid ? "is-valid" : "is-invalid";
            }
            if (this.state.form.name.valid && this.state.form.email.valid && this.state.form.password.valid) {
                overallValidation = true;
            }
        } else {
            nameValidation = null;
            emailValidation = null;
            passValidation = null;
            if (credentialError) {
                emailValidation = "is-invalid";
                passValidation = "is-invalid";
                emailInvalidFeedback = "Invalid Credential";
            }
        }

        let nameField = (
            <Form.Group as={Row} controlId="formHorizontalName">
                <Form.Label column xs={4}>
                    Name
                </Form.Label>
                <Col xs={8}>
                    <Form.Control className={nameValidation} type="text" placeholder="Name" value={this.state.form.name.value} onChange={(event) => this.inputChangedHandler(event, "name")}/>
                    <div className="invalid-feedback">
                        This field is required
                    </div>
                </Col>
            </Form.Group>
        )
        return (
            <div className={classes.Container}>
                <h3 className={classes.Title}>Welcome to myNotes</h3>
                <Form onSubmit={this.submitHandler}>
                    {this.state.isSignup ? nameField : null}

                    <Form.Group as={Row} controlId="formHorizontalEmail">
                        <Form.Label column xs={4}>
                            Email
                        </Form.Label>
                        <Col xs={8}>
                            <Form.Control className={emailValidation} type="email" placeholder="Email" name="email" value={this.state.form.email.value} onChange={(event) => this.inputChangedHandler(event, "email")}/>
                            <div className="invalid-feedback">
                                {emailInvalidFeedback}
                            </div>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="formHorizontalPassword">
                        <Form.Label column xs={4}>
                            Password
                        </Form.Label>
                        <Col xs={8}>
                            <Form.Control className={passValidation} type="password" placeholder="Password" name="password" value={this.state.form.password.value} onChange={(event) => this.inputChangedHandler(event, "password")}/>
                            <div className="invalid-feedback">
                                {credentialError ? "Invalid Credential" : "Password should be at least 6 characters"}
                            </div>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className={classes.SubmitBtn}>
                        <Col xs={12} className={classes.ButtonContainer}>
                            <Button disabled={!overallValidation && this.state.isSignup} type="submit">{this.state.isSignup ? "SIGN UP" : "SIGN IN"}</Button>
                        </Col>
                    </Form.Group>
                </Form>
                <h5 className={classes.Title}>OR</h5>
                <Col xs={12} className={classes.ButtonContainer}>
                    <Button variant="outline-primary" onClick={this.switchAuthModeHandler}>{this.state.isSignup ? "SIGN IN" : "SIGN UP"}</Button>
                </Col>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        authError: state.auth.error
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onSignup: (name, email, password) => dispatch(actions.signup(name, email, password)),
        onLogin: (email, password) => dispatch(actions.login(email, password))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticationPage);