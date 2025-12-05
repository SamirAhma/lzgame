# Git Push Failed: "agent refused operation" & "Permission denied"

## Problem
When running `git push`, the following errors occurred:
```text
sign_and_send_pubkey: signing failed for ED25519 "/home/madin/.ssh/id_ed25519" from agent: agent refused operation
git@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.
```

## Cause
The SSH private key file (`/home/madin/.ssh/id_ed25519`) had insecure permissions (too open, likely 755 or 777). 
The SSH agent refuses to use a private key if it is accessible by other users, as this is a security risk.

## Solution
Restrict the file permissions so that only the owner can read/write the private key.

1.  **Fix Private Key Permissions:**
    ```bash
    chmod 600 ~/.ssh/id_ed25519
    ```
    *(600 = Read/Write for owner, No access for others)*

2.  **Fix Public Key Permissions (Optional but good practice):**
    ```bash
    chmod 644 ~/.ssh/id_ed25519.pub
    ```
    *(644 = Read/Write for owner, Read for others)*

3.  **Add Key to Agent:**
    ```bash
    ssh-add ~/.ssh/id_ed25519
    ```

4.  **Verify:**
    ```bash
    ssh -T git@github.com
    ```
