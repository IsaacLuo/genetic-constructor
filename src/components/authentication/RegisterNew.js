/*
 Copyright 2016 Autodesk,Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import queryString from 'query-string';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { projectOpen } from '../../actions/projects';
import { uiShowAuthenticationForm, uiSpin } from '../../actions/ui';
import { userRegister } from '../../actions/user';

import track from '../../analytics/ga';
import { privacy, tos } from '../../utils/ui/uiapi';

import Modal from '../Modal';
import FormGroup from '../formElements/FormGroup';
import Checkbox from '../formElements/Checkbox';
import Captcha from '../formElements/Captcha';
import FormRadio from '../formElements/FormRadio';
import FormText from '../formElements/FormText';
import FormPassword from '../formElements/FormPassword';

//This component replaces the previous REgistration form. will deprecate prior one once complete

const emailValidator = email => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);

//todo - what are all the rules
const passwordValidator = password => (
  typeof password === 'string' &&
  password.length >= 6 &&
  /[a-z0-9]/.test(password)
);

export class RegisterFormNew extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    registerType: PropTypes.string,
    uiShowAuthenticationForm: PropTypes.func.isRequired,
    uiSpin: PropTypes.func.isRequired,
    userRegister: PropTypes.func.isRequired,
    projectOpen: PropTypes.func.isRequired,
  };

  //get the configuration from the URL, to configure how the user is onboarded
  static getConfig() {
    const params = queryString.parse(window.location.search);
    const { projects, extensions } = params;
    const config = {};

    if (projects) {
      const projectNames = projects.split(',');
      config.projects = projectNames.reduce((acc, projectName) => Object.assign(acc, { [projectName]: {} }), {});
      Object.assign(config.projects[projectNames[0]], { default: true });
    }

    if (extensions) {
      config.extensions = extensions.split(',').reduce((acc, projectName) => Object.assign(acc, { [projectName]: { active: true } }), {});
    }

    return config;
  }

  static validateForm(formState) {
    return (
      formState.firstName &&
      formState.lastName &&
      formState.email &&
      emailValidator(formState.email) &&
      formState.password &&
      passwordValidator(formState.password) &&
      formState.accountType &&
      formState.verification &&
      formState.legal
    );
  }

  static registerUser(formState) {
    alert('registering!');
    console.log(formState);

    //todo
  }

  constructor(props) {
    super(props);

    this.actions = [{
      text: 'Sign Up',
      disabled: () => !RegisterFormNew.validateForm(this.state),
      onClick: () => RegisterFormNew.registerUser(this.state),
    }];

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      accountType: props.registerType,
      verification: false,
      legal: false,
    };
  }

  //special handling for 'darwin magic' dummy user
  onFirstName = evt => {
    if (evt.target.value === 'darwin magic') {
      this.setState({
        firstName: 'Charles',
        lastName: 'Darwin',
        email: `charlesdarwin_${Date.now()}@royalsociety.co.uk`,
        password: '123456',
        accountType: 'free',
        verification: true,
        legal: true,
      });
      return;
    }
    this.setState({ firstName: evt.target.value });
  };

  onLastName = evt => this.setState({ lastName: evt.target.value });

  onEmail = evt => this.setState({ email: evt.target.value });

  onPassword = evt => this.setState({ password: evt.target.value });

  onAccountTypeChange = accountType => this.setState({ accountType });

  onCaptcha = isVerified => this.setState({ verification: isVerified });

  onLegalCheck = isChecked => this.setState({ legal: isChecked });

  render() {
    const passwordError = '';
    const emailError = '';

    return (
      <Modal
        isOpen={this.props.isOpen}
        onClose={() => this.props.uiShowAuthenticationForm('none')}
        actions={this.actions}
        title="Sign Up"
        style={{ content: { width: '740px' } }}
      >
        <div className="Modal-banner">
          <span>Already have a Genetic Constructor account? </span>
          <a onClick={() => this.props.uiShowAuthenticationForm('signin')}>Sign In...</a>
        </div>

        <FormGroup
          label="Full Name"
        >
          <FormText
            value={this.state.firstName}
            placeholder="First Name"
            onChange={this.onFirstName}
          />
          <FormText
            value={this.state.lastName}
            placeholder="Last Name"
            onChange={this.onLastName}
          />
        </FormGroup>

        <FormGroup
          label="Email"
          error={emailError}>
          <FormText
            value={this.state.email}
            placeholder="Email Address"
            onChange={this.onEmail}
          />
        </FormGroup>

        <FormGroup label="Password">
          <FormPassword
            value={this.state.password}
            placeholder="Password"
            onChange={this.onPassword}
          />
        </FormGroup>

        <FormGroup label="Account Type">
          <div data-why="vertical-override-flex-row">
            <FormRadio
              checked={this.state.accountType === 'free'}
              name="accountType"
              value="free"
              onChange={() => this.onAccountTypeChange('free')}
              label="Academic - Unlimited, free access"
            />
            <FormRadio
              checked={this.state.accountType === 'paid'}
              name="accountType"
              value="paid"
              onChange={() => this.onAccountTypeChange('paid')}
              label="Individual - Unlimited free trial during BETA"
            />
            <FormRadio
              checked={false}
              name="accountType"
              value="enterprise"
              onChange={() => {}}
              label="Enterprise - My company has an account"
              disabled
            />
          </div>
        </FormGroup>

        <FormGroup
          label="Verification"
          labelTop
        >
          <Captcha onVerify={this.onCaptcha} />
        </FormGroup>

        <FormGroup
          label="Legal"
          labelTop
        >
          <div>
            <Checkbox
              style={{ fontSize: '18px', marginLeft: '0' }}
              checked={this.state.legal}
              onChange={this.onLegalCheck}
            />
            <span style={{ marginLeft: '0.5em' }}>Legal smauh</span>
          </div>
        </FormGroup>

      </Modal>
    );
  }
}

export default connect(state => ({
  isOpen: state.ui.modals.authenticationForm === 'register',
  registerType: state.ui.modals.authFormParams.registerType,
}), {
  uiShowAuthenticationForm,
  uiSpin,
  userRegister,
  projectOpen,
})(RegisterFormNew);
