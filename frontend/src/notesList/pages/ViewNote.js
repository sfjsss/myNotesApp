import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';

import classes from './ViewNote.module.css';

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class ViewNote extends Component {
    state = {
        noteData: {
            title: null,
            description: null,
            createdAt: null,
            updatedAt: null,
            sharedUsers: [],
            creator: {
                name: null
            }
        },
        shareEmail: {
            value: "",
            valid: false,
            touched: false,
            validation: {
                required: true,
                isEmail: true
            }
        },
        emailUniquenessError: false,
        isNoteCreator: false
    }

    checkValidity (value, rules) {
        let isValid = true;

        if (!rules) {
            return true;
        }

        if (rules.required) {
            isValid = value.trim() !== "" && isValid;
        }

        if (rules.isEmail) {
            const pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
            isValid = pattern.test(value) && isValid;
        }

        return isValid;
    }

    shareHandler = (event) => {
        event.preventDefault();
        this.setState({emailUniquenessError: false});
        const shareData = {
            email: this.state.shareEmail.value
        }
        axios.post('http://localhost:5000/api/notes/share/' + this.props.match.params.nid + '?auth=' + this.props.token, shareData)
            .then(response => {
                this.fetchNoteData();
            })
            .catch(error => {
                if (error.response.data.message === 'invalidEmail') {
                    this.setState({emailUniquenessError: true});
                }
            })
    }

    inputChangedHandler = (event) => {
        const updatedShareEmail = {
            ...this.state.shareEmail,
            value: event.target.value,
            valid: this.checkValidity(event.target.value, this.state.shareEmail.validation),
            touched: true
        }
        this.setState({shareEmail: updatedShareEmail});
    }

    componentDidMount = () => {
        this.fetchNoteData();
    }

    fetchNoteData = () => {
        axios.get('http://localhost:5000/api/notes/' + this.props.match.params.nid + '?auth=' + this.props.token)
            .then(response => {
                let updatedCreatorStatus = false;
                if (response.data.note.creator._id === this.props.userId) {
                    updatedCreatorStatus = true;
                }
                this.setState({
                    noteData: {
                        title: response.data.note.title,
                        description: response.data.note.description,
                        createdAt: response.data.note.createdAt,
                        updatedAt: response.data.note.updatedAt,
                        sharedUsers: response.data.note.sharedUsers,
                        creator: response.data.note.creator
                    },
                    isNoteCreator: updatedCreatorStatus
                });
            })
            .catch(error => {
                console.log(error);
            })
    }

    deleteHandler = () => {
        axios.delete('http://localhost:5000/api/notes/remove/' + this.props.match.params.nid + '?auth=' + this.props.token)
            .then(response => {
                this.props.history.replace('/notes');
            })
            .catch(error => {
                console.log(error);
            })
    }

    unshareHandler = (userId) => {
        const shareData = {
            userId: userId
        }
        axios.post('http://localhost:5000/api/notes/unshare/' + this.props.match.params.nid + '?auth=' + this.props.token, shareData)
            .then(response => {
                this.fetchNoteData();
            })
            .catch(error => {
                console.log(error.response.data.message);
            })
    }

    render () {
        let emailValidation;
        let overallValidation = false;
        if (this.state.shareEmail.touched) {
            emailValidation = this.state.shareEmail.valid && !this.state.emailUniquenessError ? "is-valid" : "is-invalid";
        }
        if (this.state.shareEmail.valid) {
            overallValidation = true;
        }

        let sensitiveInfo = null;
        if (this.state.isNoteCreator) {
            sensitiveInfo = (
                <React.Fragment>
                    <div className={classes.ButtonContainer}>
                        <Button onClick={this.deleteHandler} variant="outline-danger">DELETE</Button>
                        <Link to={'/notes/edit/' + this.props.match.params.nid}><Button>EDIT</Button></Link>
                    </div>
                    <h3 className={classes.Title}>Share this note</h3>
                    <Form id="shareForm">
                        <Form.Group as={Row} controlId="shareEmail">
                            <Col xs={8}>
                                <Form.Control className={emailValidation} value={this.state.shareEmail.value} onChange={(event) => this.inputChangedHandler(event)} type="email" placeholder="Email to share" />
                                <div className="invalid-feedback">
                                    {this.state.emailUniquenessError ? 'No user was found with this email' : 'Please enter a valid email'}
                                </div>
                            </Col>
                            <Col xs={4}>
                                <Button onClick={(event) => this.shareHandler(event)} disabled={!overallValidation} type="submit">SHARE</Button>
                            </Col>
                        </Form.Group>
                    </Form>
                    <Table variant="dark">
                        <thead>
                            <tr>
                                <td>User</td>
                                <td>Email</td>
                                <td>Actions</td>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.noteData.sharedUsers.map(user => {
                                return (
                                    <tr key={user._id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td><span onClick={() => this.unshareHandler(user._id)} className={classes.DeleteLink}>unshare</span></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </React.Fragment>
            )
        }
        return (
            <div className={classes.Container}>
                <div className={classes.TableHeader}>
                    <h3 className={classes.Title}>Details</h3>
                    <Link to="/notes">Back to notes</Link>
                </div>
                <Table className={classes.Table} variant="dark">
                    <tbody>
                        <tr>
                            <td>Title</td>
                            <td>{this.state.noteData.title}</td>
                        </tr>
                        <tr>
                            <td>Description</td>
                            <td>{this.state.noteData.description}</td>
                        </tr>
                        <tr>
                            <td>Creator</td>
                            <td>{this.state.noteData.creator.name}</td>
                        </tr>
                        <tr>
                            <td>Created Date</td>
                            <td>{this.state.noteData.createdAt}</td>
                        </tr>
                        <tr>
                            <td>Updated Date</td>
                            <td>{this.state.noteData.updatedAt}</td>
                        </tr>
                    </tbody>
                </Table>
                {sensitiveInfo}
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

export default connect(mapStateToProps)(ViewNote);