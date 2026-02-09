import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    username : Text;
    profilePicture : ?Storage.ExternalBlob;
    status : Text;
  };

  public type ChatMessage = {
    sender : Principal;
    content : Text;
    timestamp : Int;
    media : ?Storage.ExternalBlob;
  };

  include MixinStorage();

  var messageCounter = 0;
  let messages = Map.empty<Nat, ChatMessage>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Track authenticated users separately from role-based access control
  let authenticatedUsers = Map.empty<Principal, Bool>();

  let credentials = Map.fromIter(
    [("darling", "181818"), ("myhoney", "182518")].values()
  );

  // Helper function to check if user is authenticated (either via login or has user role)
  private func isAuthenticated(caller : Principal) : Bool {
    // Check if user logged in via credentials
    switch (authenticatedUsers.get(caller)) {
      case (?true) { return true };
      case (_) {};
    };
    // Or check if user has role-based permission
    AccessControl.hasPermission(accessControlState, caller, #user);
  };

  public shared ({ caller }) func login(username : Text, password : Text) : async UserProfile {
    let normalizedUsername = username.trim(#char(' '));
    switch (credentials.get(normalizedUsername)) {
      case (?storedPassword) {
        if (storedPassword != password) {
          Runtime.trap("Incorrect password.");
        };
      };
      case (null) { Runtime.trap("User not found."); };
    };

    // Mark user as authenticated via credential verification
    authenticatedUsers.add(caller, true);

    // Initialize profile if it doesn't exist
    switch (userProfiles.get(caller)) {
      case (null) {
        let initialProfile : UserProfile = {
          username;
          profilePicture = null;
          status = "";
        };
        userProfiles.add(caller, initialProfile);
      };
      case (?_) { /* Profile already exists */ };
    };

    switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Internal error: Profile not found after creation") };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateProfile(profilePicture : ?Storage.ExternalBlob, status : Text) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can update their profile");
    };

    // Get existing profile or create new one
    let existingProfile = userProfiles.get(caller);
    let username = switch (existingProfile) {
      case (?profile) { profile.username };
      case (null) { "Unknown" };
    };

    let profile : UserProfile = {
      username;
      profilePicture = profilePicture;
      status = status;
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getProfile(user : Principal) : async ?UserProfile {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func sendMessage(content : Text, media : ?Storage.ExternalBlob) : async () {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can send messages");
    };

    let timestamp = 0;
    let message : ChatMessage = {
      sender = caller;
      content = content;
      timestamp = timestamp;
      media = media;
    };

    messages.add(messageCounter, message);
    messageCounter += 1;
  };

  public query ({ caller }) func getMessages() : async [ChatMessage] {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view messages");
    };
    messages.values().toArray();
  };

  public query ({ caller }) func getGallery() : async [Storage.ExternalBlob] {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Only authenticated users can view the gallery");
    };

    messages.values().toArray().map(func(msg : ChatMessage) : ?Storage.ExternalBlob { msg.media }).filter(func(media : ?Storage.ExternalBlob) : Bool { media.isSome() }).map(func(media : ?Storage.ExternalBlob) : Storage.ExternalBlob {
      switch (media) {
        case (?blob) { blob };
        case (null) { Runtime.trap("Unexpected null media") };
      };
    });
  };
};
