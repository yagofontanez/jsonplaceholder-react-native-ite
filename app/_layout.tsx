import { Comment, getCommentsByPostId, getPostById, Post } from "@/api";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  DefaultTheme,
  Divider,
  Provider as PaperProvider,
  Paragraph,
  Text,
  TextInput,
  Title,
} from "react-native-paper";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#2B6CB0",
    accent: "#06B6D4",
    background: "#F4F6F8",
    surface: "#FFFFFF",
    text: "#1F2937",
  },
};

export default function RootLayout() {
  const [postIdText, setPostIdText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateId = (text: string): number | null => {
    const n = Number(text.trim());
    if (!Number.isInteger(n) || n < 1 || n > 100) return null;
    return n;
  };

  const handleBuscar = async () => {
    setError(null);
    setPost(null);
    setComments([]);
    const id = validateId(postIdText);
    if (!id) {
      setError("Informe um ID válido entre 1 e 100.");
      return;
    }

    setLoading(true);
    try {
      const [fetchedPost, fetchedComments] = await Promise.all([
        getPostById(id),
        getCommentsByPostId(id),
      ]);
      setPost(fetchedPost);
      setComments(fetchedComments);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível carregar o post. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Title style={styles.headerTitle}>Posts & Comentários</Title>
              <Paragraph style={styles.headerSubtitle}>
                Digite um ID (1–100) para buscar o post.
              </Paragraph>
            </View>

            <Card style={styles.searchCard}>
              <Card.Content>
                <TextInput
                  label="ID do post"
                  mode="outlined"
                  value={postIdText}
                  onChangeText={setPostIdText}
                  keyboardType="number-pad"
                  placeholder="Ex: 12"
                  maxLength={3}
                  returnKeyType="search"
                  onSubmitEditing={handleBuscar}
                  style={{ marginBottom: 10 }}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <Button
                  mode="contained"
                  onPress={handleBuscar}
                  style={styles.searchButton}
                  disabled={loading}
                >
                  {loading ? " Buscando..." : "BUSCAR"}
                </Button>
              </Card.Content>
            </Card>

            {loading && (
              <View style={styles.loading}>
                <ActivityIndicator animating size="large" />
              </View>
            )}

            {post && (
              <Card style={styles.postCard}>
                <Card.Title
                  title={`Usuário ${post.userId}`}
                  subtitle={`Post ID ${post.id}`}
                  left={(props) => (
                    <Avatar.Text
                      {...props}
                      label={String(post.userId)}
                      size={44}
                      style={{ backgroundColor: "#2563EB" }}
                    />
                  )}
                />
                <Card.Content>
                  <Title style={styles.postTitle}>{post.title}</Title>
                  <Paragraph style={styles.postBody}>{post.body}</Paragraph>
                </Card.Content>
                <Card.Actions style={styles.cardActions}>
                  <Button icon="thumb-up-outline">Curtir</Button>
                  <Button icon="comment-outline">Comentar</Button>
                </Card.Actions>
              </Card>
            )}

            {post && (
              <View style={styles.commentsSection}>
                <Title style={styles.commentsTitle}>
                  💬 Comentários ({comments.length})
                </Title>
                <Divider style={{ marginVertical: 8 }} />
                {comments.length === 0 ? (
                  <Paragraph style={{ marginTop: 12 }}>
                    Nenhum comentário.
                  </Paragraph>
                ) : (
                  comments.map((c) => (
                    <Card key={c.id} style={styles.commentCard}>
                      <Card.Title
                        title={c.name}
                        subtitle={c.email}
                        left={(props) => (
                          <Avatar.Text
                            {...props}
                            label={c.name.charAt(0).toUpperCase()}
                            size={36}
                            style={{ backgroundColor: "#06B6D4" }}
                          />
                        )}
                      />
                      <Card.Content>
                        <Paragraph style={styles.commentBody}>
                          {c.body}
                        </Paragraph>
                      </Card.Content>
                    </Card>
                  ))
                )}
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  container: {
    padding: 16,
  },

  header: { marginBottom: 16 },
  headerTitle: {
    fontSize: 22,
    marginBottom: 4,
    color: theme.colors.text,
    fontWeight: "bold",
  },
  headerSubtitle: { color: "#6b7280" },

  searchCard: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
  },
  searchButton: { borderRadius: 8 },
  errorText: { color: "#dc2626", marginBottom: 6 },

  loading: { marginTop: 20, alignItems: "center" },

  postCard: {
    marginTop: 10,
    borderRadius: 14,
    elevation: 3,
    marginBottom: 20,
  },
  postTitle: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  postBody: { marginTop: 4, fontSize: 14, color: "#374151", lineHeight: 20 },

  cardActions: { justifyContent: "flex-start", marginTop: 8 },

  commentsSection: { marginTop: 10 },
  commentsTitle: { fontSize: 18, fontWeight: "600", marginBottom: 6 },

  commentCard: {
    marginTop: 10,
    borderRadius: 12,
    elevation: 1,
  },
  commentBody: { fontSize: 14, color: "#374151", lineHeight: 20 },
});
