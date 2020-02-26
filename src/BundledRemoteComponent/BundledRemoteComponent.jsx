import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  server: PropTypes.string,
  stylesheet: PropTypes.string,
  source: PropTypes.string.isRequired,
  componentName: PropTypes.string.isRequired,
  loadingComponent: PropTypes.element,
  unloadSourcesOnUnmount: PropTypes.bool
};

class BundledRemoteComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  loadSource = () => {
    const component = this;
    const { server, source } = this.props;

    if (server && source) {
      const src = `${server}${source}`;

      for (var i = 0; i < document.scripts.length; i++) {
        const scriptElement = document.scripts[i];

        if (scriptElement.src === src) {
          var refCount = scriptElement.dataset.refCount;

          if (refCount === undefined) {
            scriptElement.dataset.refCount = '1';
          } else {
            scriptElement.dataset.refCount = (parseInt(refCount) + 1).toString();
          }

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
      script.dataset.refCount = '1';

      this.setState({ script : script }, () => {
        document.head.appendChild(script);
      })
    } else {
      this.setState({ stylesheetLoaded : true })
    }
  }

  unloadSource = () => {
    const { server, source } = this.props;

    if (server && source) {
      const src = `${server}${source}`;

      for (var i = 0; i < document.scripts.length; i++) {
        const scriptElement = document.scripts[i];

        if (scriptElement.src === src) {
          var refCount = parseInt(scriptElement.dataset.refCount);
          scriptElement.dataset.refCount = (refCount - 1).toString();

          if ((refCount - 1) === 0) {
            scriptElement.remove();
          }
        }
      }
    }
  }

  loadStylesheet = () => {
    const component = this;
    const { server, stylesheet } = this.props;

    if (server && stylesheet) {
      const href = `${server}${stylesheet}`;

      for (var i = 0; i < document.styleSheets.length; i++) {
        const stylesheetElement = document.styleSheets[i];

        if (stylesheetElement.href === href) {
          var refCount = stylesheetElement.ownerNode.dataset.refCount;

          if (refCount === undefined) {
            stylesheetElement.ownerNode.dataset.refCount = '1';
          } else {
            stylesheetElement.ownerNode.dataset.refCount = (parseInt(refCount) + 1).toString();
          }

          return this.setState({ stylesheetLoaded : true })
        }
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';

      link.onload = function() {
        component.setState({ stylesheetLoaded : true });
      }

      link.href = href;
      link.dataset.refCount = '1';

      this.setState({ link : link }, () => {
        document.getElementsByTagName('HEAD')[0].appendChild(link);
      })
    } else {
      this.setState({ stylesheetLoaded : true })
    }
  }

  unloadStylesheet = () => {
    const { server, stylesheet } = this.props;

    if (server && stylesheet) {
      const href = `${server}${stylesheet}`;

      for (var i = 0; i < document.styleSheets.length; i++) {
        const stylesheetElement = document.styleSheets[i];

        if (stylesheetElement.href === href) {
          var refCount = parseInt(stylesheetElement.ownerNode.dataset.refCount);
          stylesheetElement.ownerNode.dataset.refCount = (refCount - 1).toString();

          if ((refCount - 1) === 0) {
            stylesheetElement.ownerNode.remove();
          }
        }
      }
    }
  }

  componentDidMount() {
    this.loadSource();
    this.loadStylesheet();
  }

  componentWillUnmount() {
    const { unloadSourcesOnUnmount } = this.props;

    if (unloadSourcesOnUnmount) {
      this.unloadStylesheet();
      this.unloadSource();
    }
  }

  render() {
    const { stylesheetLoaded, sourceLoaded, error } = this.state;

    const {
      stylesheet,
      source,
      componentName,
      loadingComponent,
      ...rest
    } = this.props;

    if (((stylesheet && stylesheetLoaded) || !stylesheet) && sourceLoaded) {
      const DynamicComponent = window[componentName];
      return (<DynamicComponent {...rest} />)
    }

    if (loadingComponent) {
      return loadingComponent;
    }

    return null;
  }
}

BundledRemoteComponent.propTypes = propTypes;

export default BundledRemoteComponent;
