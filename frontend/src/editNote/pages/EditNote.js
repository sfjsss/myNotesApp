import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import classes from './EditNote.module.css';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

class EditNote extends Component {
    state = {
        form: {
            title: {
                value: "",
                valid: true,
                touched: false,
                validation: {
                    required: true
                }
            },
            description: {
                value: "",
                valid: true,
                touched: false,
                validation: {
                    required: true,
                    minLength: 6
                }
            }
        }
    }

    componentDidMount = () => {
        axios.get('http://localhost:5000/api/notes/' + this.props.match.params.nid + '?auth=' + this.props.token)
            .then(response => {
                const updatedForm = {
                    ...this.state.form,
                    title: {
                        ...this.state.form.title,
                        value: response.data.note.title
                    },
                    description: {
                        ...this.state.form.description,
                        value: response.data.note.description
                    }
                }
                this.setState({form: updatedForm});
            })
            .catch(error => {
                console.log(error);
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

    cancelHandler = () => {
        this.props.history.goBack();
    }

    submitHandler = () => {
        const noteData = {
            title: this.state.form.title.value,
            description: this.state.form.description.value
        }
        axios.patch('http://localhost:5000/api/notes/' + this.props.match.params.nid + '?auth=' + this.props.token, noteData)
            .then(response => {
                this.props.history.replace('/notes');
            })
            .catch(error => {
                console.log(error);
            })
    }

    render () {
        let titleValidation;
        let descriptionValidation;
        let overallValidation = false;

        if (this.state.form.title.touched) {
            titleValidation = this.state.form.title.valid ? "is-valid" : "is-invalid";
        }
        if (this.state.form.description.touched) {
            descriptionValidation = this.state.form.description.valid ? "is-valid" : "is-invalid";
        }
        if (this.state.form.title.valid && this.state.form.description.valid) {
            overallValidation = true;
        }

        return (
            <div className={classes.Container}>
                <h3 className={classes.Title}>Update the note</h3>
                <Form>
                    <Form.Group>
                        <Form.Label>Title</Form.Label>
                        <Form.Control value={this.state.form.title.value} onChange={(event) => this.inputChangedHandler(event, "title")} className={titleValidation} type="text" placeholder="title" />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control value={this.state.form.description.value} onChange={(event) => this.inputChangedHandler(event, "description")} className={descriptionValidation} as="textarea" rows="3" placeholder="description" />
                        <div className="invalid-feedback">
                            description should be at least 6 characters
                        </div>
                    </Form.Group>
                    <div className={classes.ButtonContainer}>
                        <Button onClick={this.cancelHandler} variant="outline-danger">CANCEL</Button>
                        <Button onClick={this.submitHandler} disabled={!overallValidation} variant="primary">SUBMIT</Button>
                    </div>
                </Form>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        token: state.auth.token,
        userId: state.auth.userId
    }
}

export default connect(mapStateToProps)(EditNote);