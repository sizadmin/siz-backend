import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    //   logErrorToMyService(error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }
   NoMatchPage = () => {
    document.body.style.height = "100%";
    return <iframe src="#" title="Error" />;
  };
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.NoMatchPage();
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
