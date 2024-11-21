/**
* @file Component serving /change-email, /change-password and /profile.
* Shows the profile logo and name in the page header, if user is logged in.
* @component <ProfileHeader/>
*/

import React from 'react';

const ProfileHeader = ({ imageSrc, userName, adminView }) => {
  const adminViewElement = adminView ? <div>Viewing user: </div>: ""; 
  return (
    <div className="profile-header">
      <img src={imageSrc} className="profile-logo" alt="Profile Logo" />
      <div className="profile-name">
        {adminViewElement}
        <>{userName || "Not logged in"}</>
      </div>
    </div>
  );
};

export default ProfileHeader;
