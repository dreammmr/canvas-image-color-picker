import styled from "styled-components";

export const ColorPickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const ColorPickerHeader = styled.header`
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: start;
  padding: 20px;
    
  button {
    background-color: #F0F0F0;
    width: 40px;
    height: 40px;
    border-radius: 100%;
    border: none;
    margin-top: 20px;
      
    &[disabled] {
      pointer-events: none;
    }
  }

  p {
    color: grey;
    font-size: 10px;
    pointer-events: none;
    margin-top: 20px;
  }
`;

export const ColorPickerCanvas = styled.canvas`
  display: block;
`;

export const ColorPickerPreviewCanvas = styled.canvas`
  position: absolute;
  border: 10px solid transparent;
  border-radius: 100px;
  pointer-events: none;
`;
