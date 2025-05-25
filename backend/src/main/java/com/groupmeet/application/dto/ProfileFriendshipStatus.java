package com.groupmeet.application.dto;

public enum ProfileFriendshipStatus {
    NONE,                // Keine Verbindung zwischen den Benutzern
    SELF,                // Benutzer sieht sich sein eigenes Profil an
    FRIENDS,             // Sind Freunde
    REQUEST_SENT,        // Der Besucher hat eine Anfrage an den Profilinhaber gesendet
    REQUEST_RECEIVED     // Der Besucher hat eine Anfrage vom Profilinhaber erhalten
}