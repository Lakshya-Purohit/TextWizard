import React, { useState } from 'react';

const About = () => {
  const [myStyle, setMyStyle] = useState({
    color: 'black',
    backgroundColor: 'white'
  });

  const [btnText, setBtnText] = useState('Enable Dark Mode');

  const toggleStyle = () => {
    if (myStyle.color === 'white') {
      setMyStyle({
        color: 'black',
        backgroundColor: 'white'
      });

      setBtnText('Enable Dark Mode');
    } else {
      setMyStyle({
        color: 'white',
        backgroundColor: 'black'
      });

      setBtnText('Enable Light Mode');
    }
  };

  return (
    <div className="container my-4" style={myStyle}>
      <div className="row align-items-center py-5">

        {/* Profile Image */}
        <div className="col-md-4 text-center mb-4 mb-md-0">
          <img
            src="/profile.jpg"
            alt="Lakshya Purohit"
            className="img-fluid rounded-circle shadow"
            style={{
              maxWidth: '250px',
              width: '100%'
            }}
          />
        </div>

        {/* About Content */}
        <div className="col-md-8">
          <p className="mb-1">
            Hi there! I am
          </p>

          <h1 className="display-5 fw-bold">
            Lakshya Purohit
          </h1>

          <span className="badge bg-success mb-3">
            Available for work
          </span>

          <h3 className="mb-3">
            Software Developer
          </h3>

          <p className="lead">
            I specialize in building{' '}
            <strong>scalable, high-performance</strong>{' '}
            enterprise systems. Passionate about complex backend
            architectures, real-time communication, and database
            optimization — engineering solutions that handle
            thousands of concurrent users.
          </p>

          {/* Buttons */}
          <div className="d-flex gap-3 flex-wrap mb-4">

            <a
              href="https://www.lakhsyapurohit.online/#contact"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              Let's Collaborate
            </a>

            <a
              href="https://www.lakhsyapurohit.online/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-primary"
            >
              Visit My Portfolio
            </a>

          </div>

          {/* Statistics */}
          <div className="row text-center">

            <div className="col-4">
              <h4 className="fw-bold">
                2+
              </h4>
              <p>
                Years Experience
              </p>
            </div>

            <div className="col-4">
              <h4 className="fw-bold">
                10+
              </h4>
              <p>
                Projects Delivered
              </p>
            </div>

            <div className="col-4">
              <h4 className="fw-bold">
                70%
              </h4>
              <p>
                Performance Gain
              </p>
            </div>

          </div>

          {/* Dark/Light Mode Button */}
          <button
            onClick={toggleStyle}
            className="btn btn-outline-secondary mt-3"
          >
            {btnText}
          </button>

        </div>
      </div>
    </div>
  );
};

export default About;