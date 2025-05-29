import { useTheme } from '@mui/material/styles';
import { css } from '@emotion/react';

// Compatibility layer for makeStyles using emotion CSS
export const makeStyles = (stylesFunc) => {
  return (props = {}) => {
    const theme = useTheme();
    
    // Get styles from the function
    const styles = typeof stylesFunc === 'function' ? stylesFunc(theme) : stylesFunc;
    
    // Convert styles object to CSS classes using emotion
    const classes = {};
    Object.keys(styles).forEach(key => {
      const styleObj = styles[key];
      classes[key] = css(styleObj);
    });
    
    return classes;
  };
};

// For cases where makeStyles is used without hooks (outside components)
export const makeStylesStatic = (stylesFunc) => {
  return (theme = {}) => {
    const styles = typeof stylesFunc === 'function' ? stylesFunc(theme) : stylesFunc;
    
    const classes = {};
    Object.keys(styles).forEach(key => {
      const styleObj = styles[key];
      classes[key] = css(styleObj);
    });
    
    return classes;
  };
};

export default makeStyles; 