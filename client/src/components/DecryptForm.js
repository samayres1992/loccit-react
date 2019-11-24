import React, { Component } from 'react';
import { connect } from 'react-redux';
import CryptoJS from 'crypto-js';
import { parse } from 'flatted/esm';
import { Form, Field } from 'react-final-form';
import classNames from 'classnames';
import * as actions from '../actions';

const mapStateToProps = (state) => {
  return {
    ...state,
    state
  };
}

class DecryptForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      ...props,
      unlocked: false
    }
  }

  componentDidMount() {
    const path = window.location.pathname.split('/')[2];
    this.props.checkUrl(path);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(prevState.unlock !== this.state.unlock) {
      return true;
    }
  }

  inputRender = (inputField) => (
    <input {...inputField.input} name={inputField.name} className={classNames({"has-content": inputField.meta.dirty, "fancy-input": !inputField.dirty})} type={inputField.type} placeholder="" type="text" required />
  );

  decryptData (passcode) {
    // Let's take the value and decrypt it
    const { encryptedData, title } = this.props.retrievedData;
    const data = parse(encryptedData);

    // Decrypt
    try {
      let bytes  = CryptoJS.AES.decrypt(data, passcode.passcode.toString());
      let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      // Merge in the title for better readability to user
      Object.assign(decryptedData, {title});
      this.props.passcodeDecrypted(decryptedData);
      this.setState({ unlocked: true });
    } catch(e) {
      // TODO: Didn't work, notify user
      console.log("error", e);
    }

	}

  onSubmit = values => {
    this.decryptData(values);
  }

  render() {
    const { pristine, submitting} = this.props;
    return (
      <Form 
        onSubmit={this.onSubmit}
        render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <div className="input-effect">
            <Field name="passcode" component={this.inputRender} />
              <label>Passcode</label>
              <span className="focus-border">
                <i></i>
              </span>
          </div>
          <button className="submit button fancy-button" disabled={pristine || submitting}>
              Decrypt
              <span className="focus-border">
                <i></i>
              </span>
          </button>
        </form>
      )} />
    );
  }
}

export default connect(mapStateToProps, actions)(DecryptForm);


