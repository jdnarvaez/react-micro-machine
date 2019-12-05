import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  server: PropTypes.string,
  stylesheet: PropTypes.string,
  source: PropTypes.string.isRequired,
  componentName: PropTypes.string.isRequired,
  loadingComponent: PropTypes.element,
  errorComponent: PropTypes.element
};

class BundledRemoteComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.loadSource = this.loadSource.bind(this);
    this.loadStylesheet = this.loadStylesheet.bind(this);
  }

  loadSource() {
    const component = this;
    const { server, source } = this.props;

    if (server && source) {
      const src = `${server}${source}`;

      for (var i = 0; i < document.scripts.length; i++) {
        if (document.scripts[i].src === src) {
           return this.setState({ sourceLoaded : true })
        }
      }

      const script = document.createElement('script');

      script.onload = function(e) {
        component.setState({ sourceLoaded : true });
      }

      script.onerror = function(e) {
        component.setState({ error : e });
      }

      script.src = src;

      this.setState({ script : script }, () => {
        document.head.appendChild(script); //or something of the likes
      })
    } else {
      this.setState({ stylesheetLoaded : true })
    }
  }

  loadStylesheet() {
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

      link.onload = function() {
        component.setState({ stylesLoaded : true });
      }

      link.href =  href;

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
    const { stylesheetLoaded, sourceLoaded, error } = this.state;

    const {
      stylesPath,
      sourcePath,
      componentName,
      loadingComponent,
      errorComponent,
      ...rest
    } = this.props;

    if (((stylesPath && stylesheetLoaded) || !stylesPath) && sourceLoaded) {
      const DynamicComponent = window[componentName];
      return (<DynamicComponent {...rest} />)
    }

    if (error) {
      return errorComponent;
    }

    if (loadingComponent) {
      return loadingComponent;
    }

    return null;
  }
}

BundledRemoteComponent.propTypes = propTypes;

export default BundledRemoteComponent;
