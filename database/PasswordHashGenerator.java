import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Standalone SHA-256 Password Hash Generator.
 * Uses only standard Java libraries (java.security.MessageDigest).
 *
 * Compilation & Execution (No Maven needed):
 *   javac PasswordHashGenerator.java
 *   java PasswordHashGenerator YourPasswordHere
 */
public class PasswordHashGenerator {

    /**
     * Calculates the lowercase hexadecimal SHA-256 hash of a string.
     */
    public static String calculateSha256(String input) {
        if (input == null) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(encodedHash.length * 2);
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString().toLowerCase();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available in Java runtime", e);
        }
    }

    /**
     * Constant-time comparison between raw password SHA-256 hash and stored hash.
     */
    public static boolean verify(String rawPassword, String storedHash) {
        if (rawPassword == null || storedHash == null) {
            return false;
        }
        String calculated = calculateSha256(rawPassword);
        byte[] calculatedBytes = calculated.getBytes(StandardCharsets.UTF_8);
        byte[] storedBytes = storedHash.trim().toLowerCase().getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(calculatedBytes, storedBytes);
    }

    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("=================================================================");
            System.out.println(" SHA-256 Password Hash Generator (Standard Java)");
            System.out.println("=================================================================");
            System.out.println("Usage: java PasswordHashGenerator <plainTextPassword>");
            System.out.println("Example: java PasswordHashGenerator Secret@123");
            System.out.println("=================================================================");
            return;
        }

        String rawPassword = args[0];
        String sha256Hex = calculateSha256(rawPassword);

        System.out.println("=================================================================");
        System.out.println(" Plain Text Password : " + rawPassword);
        System.out.println(" SHA-256 Hash (Hex)  : " + sha256Hex);
        System.out.println(" Verification Check  : " + verify(rawPassword, sha256Hex));
        System.out.println("=================================================================");
    }
}
