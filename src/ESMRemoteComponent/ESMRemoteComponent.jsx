import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  server: PropTypes.string,
  stylesheet: PropTypes.string,
  source: PropTypes.string.isRequired,
  loadingComponent: PropTypes.element,
  errorComponent: PropTypes.element
};

class ESMRemoteComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  loadSource = () => {
    const component = this;
    const { server, source } = this.props;

    if (server && source) {
      const url = `${server}${source}`;

      import(/* webpackIgnore: true */ url).then((module) => {
        this.setState({ sourceLoaded : true, DynamicComponent : module.default });
      }).catch(err => this.setState({ error : err }))
    }
  }

  loadStylesheet = () => {
    const component = this;
    const { server, stylesheet } = this.props;

    if (server && stylesheet) {
      const href = `${server}${stylesheet}`;

      for (var i = 0; i < document.styleSheets.length; i++) {
        if (document.styleSheets[i].href === href) {
           return this.setState({ stylesheetLoaded : true })
        }
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href =  href;

      link.onload = function(e) {
        component.setState({ stylesheetLoaded : true });
      }

      this.setState({ link : link }, () => {
        document.getElementsByTagName('HEAD')[0].appendChild(link);
      })
    } else {
      this.setState({ stylesheetLoaded : true })
    }
  }

  componentDidMount() {
    this.loadSource();
    this.loadStylesheet();
  }

  render() {
    const { stylesheetLoaded, sourceLoaded, DynamicComponent, error } = this.state;

    const {
      stylesheet,
      source,
      loadingComponent,
      errorComponent,
      ...rest
    } = this.props;

    try {
      if (((stylesheet && stylesheetLoaded) || !stylesheet) && sourceLoaded) {
        return (<DynamicComponent {...rest} />)
      }
    } catch (err) {
      console.error(err);

      if (errorComponent) {
        return errorComponent;
      } else {
        return null;
      }
    }

    if (error) {
      if (errorComponent) {
        return errorComponent;
      }

      return null;
    }

    if (loadingComponent) {
      return loadingComponent;
    }

    return null;
  }
}

ESMRemoteComponent.propTYpes = propTypes;

export default ESMRemoteComponent;
