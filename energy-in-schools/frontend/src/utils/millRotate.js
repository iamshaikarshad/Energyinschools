export default function millRotate() {
  function addRotateTransform(targetId, speed, direction) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const elementToRotate = document.getElementById(targetId);
    const myTransform = document.createElementNS(svgNS, 'animateTransform');
    if (elementToRotate) {
      const bb = elementToRotate.getBBox();
      const cx = bb.x + bb.width / 2;
      const cy = bb.y + bb.height / 2;

      myTransform.setAttributeNS(null, 'attributeName', 'transform');
      myTransform.setAttributeNS(null, 'attributeType', 'XML');
      myTransform.setAttributeNS(null, 'type', 'rotate');
      myTransform.setAttributeNS(null, 'dur', `${speed}s`);
      myTransform.setAttributeNS(null, 'repeatCount', 'indefinite');
      myTransform.setAttributeNS(null, 'from', `0 ${cx} ${cy}`);
      myTransform.setAttributeNS(null, 'to', `${360 * direction} ${cx} ${cy}`);

      elementToRotate.appendChild(myTransform);
      myTransform.beginElement();
    }
  }

  const millsIds = ['mill_x5F_3', 'mill_x5F_1', 'mill_x5F_2_1_', 'water'];

  if (window.document && window.document.readyState) {
    millsIds.forEach((item) => {
      if (item !== 'water') {
        addRotateTransform(item, 10, 1);
      } else {
        addRotateTransform(item, 20, -1);
      }
    });
  }
}
